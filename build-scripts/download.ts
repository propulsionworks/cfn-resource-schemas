/**
 * This script downloads the source schemas from AWS.
 */

import canonicalize from "canonicalize";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createDeflate, createGunzip } from "node:zlib";
import { fromData } from "ssri";
import { ZipReader } from "zip24/reader";
import type { ResourceTypeSchema } from "../exports/types.ts";
import { Sources } from "../lib/paths.ts";

const result = await downloadSchemas();

const tempPath = join(tmpdir(), randomUUID() + ".zip");
const output = createWriteStream(tempPath);
await pipeline(result, output);

await mkdir(Sources.schemas, { recursive: true });
const zip = await ZipReader.open(tempPath);

for await (const entry of zip) {
  const schema = JSON.parse(await entry.toText()) as ResourceTypeSchema;
  await processSchema(schema, basename(entry.path, ".json"));
}

/**
 * Download the schemas from source.
 */
async function downloadSchemas(
  schemaUrl = "https://schema.cloudformation.us-east-1.amazonaws.com/CloudformationSchema.zip"
): Promise<Readable> {
  console.log(`Downloading schemas from ${schemaUrl}`);

  return await new Promise<Readable>((resolve, reject) => {
    get(
      schemaUrl,
      {
        headers: {
          "accept-encoding": "deflate, gzip",
        },
      },
      (result) => {
        const encoding = result.headers["content-encoding"];

        if (!encoding) {
          resolve(result);
        } else if (encoding === "deflate") {
          resolve(result.pipe(createDeflate()));
        } else if (encoding === "gzip") {
          resolve(result.pipe(createGunzip()));
        } else {
          reject(new Error(`can't process encoding ${encoding}`));
        }
      }
    ).end();
  });
}

/**
 * Process a single schema.
 */
async function processSchema(
  schema: ResourceTypeSchema,
  id: string
): Promise<void> {
  // apply RFC 8785 canonicalization for stable integrity and nicer diffs
  const canonicalJson = canonicalize(schema);
  assert(canonicalJson);

  // calculate the integrity of the schema – this can be used as a version id
  const integrity = fromData(canonicalJson, { algorithms: ["sha512"] });

  // in node.js, the keys will stay in the order loaded, so this will stay sorted
  const sortedSchema = {
    $id: id,
    $integrity: integrity,
    ...(JSON.parse(canonicalJson) as object),
  };

  await writeFile(
    join(Sources.schemas, id + ".json"),
    JSON.stringify(sortedSchema, undefined, 2)
  );
}
