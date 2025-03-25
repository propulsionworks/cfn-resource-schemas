import canonicalize from "canonicalize";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createDeflate, createGunzip } from "node:zlib";
import { fromData } from "ssri";
import { ZipReader } from "zip24/reader";
import type { ResourceTypeSchema } from "./src/types.ts";

const SchemaOutputPath = resolve(import.meta.dirname, "./schemas");

const SchemaUrl =
  "https://schema.cloudformation.us-east-1.amazonaws.com/CloudformationSchema.zip";

console.log(`Downloading schemas from ${SchemaUrl}`);

const result = await new Promise<Readable>((resolve, reject) => {
  get(
    SchemaUrl,
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

const tempPath = join(tmpdir(), randomUUID() + ".zip");
const output = createWriteStream(tempPath);
await pipeline(result, output);

await mkdir(SchemaOutputPath, { recursive: true });
const zip = await ZipReader.open(tempPath);

for await (const entry of zip) {
  const schema = JSON.parse(await entry.toText()) as ResourceTypeSchema;

  const canonicalJson = canonicalize(schema);
  assert(canonicalJson);

  const integrity = fromData(canonicalJson, { algorithms: ["sha512"] });

  // in node, the keys will stay in order loaded, so this will end up sorted
  const sortedSchema = {
    $id: basename(entry.path, ".json"),
    $integrity: integrity,
    ...(JSON.parse(canonicalJson) as object),
  };

  await writeFile(
    join(SchemaOutputPath, entry.path),
    JSON.stringify(sortedSchema, undefined, 2)
  );
}
