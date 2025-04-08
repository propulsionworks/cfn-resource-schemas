import { PackageRoot } from "#package";
import { loadAwsServiceSpec } from "@aws-cdk/aws-service-spec";
import {
  RichSpecDatabase,
  type Resource,
  type TypeDefinition,
} from "@aws-cdk/service-spec-types";
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
import type { PropertySchema, ResourceTypeSchema } from "../types.ts";
import { getDocumentationUrl as makeAwsDocumentationUrl } from "./util.ts";

type SchemaWithDocUrl = PropertySchema & {
  documentationUrl?: string | undefined;
};

const SchemaOutputPath = resolve(PackageRoot, "./schemas");
const result = await downloadSchemas();

const tempPath = join(tmpdir(), randomUUID() + ".zip");
const output = createWriteStream(tempPath);
await pipeline(result, output);

// aws data source for better documentation
const db = new RichSpecDatabase(await loadAwsServiceSpec());

await mkdir(SchemaOutputPath, { recursive: true });
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
 * Apply documentation improvements to schema.
 */
function enhanceSchema(
  typeName: string,
  schema: SchemaWithDocUrl | ResourceTypeSchema,
  definitionName: string | undefined,
  definition: Resource | TypeDefinition
): void {
  if (definition.documentation) {
    schema.description = definition.documentation;
    schema.documentationUrl ??= makeAwsDocumentationUrl(
      typeName,
      definitionName
    );
  }
  if (!schema.description?.includes(typeName)) {
    schema.description = lines(
      definitionName
        ? `Type definition for \`${typeName}.${definitionName}\`.`
        : `Resource type definition for \`${typeName}\`.`,
      schema.description
    );
  }
  if (schema.properties) {
    const props = Object.entries(schema.properties);
    for (const [propertyName, propertySchema] of props) {
      if (typeof propertySchema === "boolean") {
        continue;
      }
      const prop = definition.properties[propertyName];
      if (prop?.documentation) {
        propertySchema.description = prop.documentation;
      }
      (propertySchema as SchemaWithDocUrl).documentationUrl =
        makeAwsDocumentationUrl(typeName, definitionName, propertyName);
    }
  }
}

/**
 * Process a single schema.
 */
async function processSchema(
  schema: ResourceTypeSchema,
  id: string
): Promise<void> {
  let resource: Resource | undefined;
  let definitions: readonly TypeDefinition[];

  try {
    resource = db.resourceByType(schema.typeName);
    definitions = db.resourceTypeDefs(schema.typeName);
  } catch {
    // there is no specific error type to catch so assume it's be cause the type
    // is not found
    definitions = [];
  }

  if (resource) {
    enhanceSchema(schema.typeName, schema, undefined, resource);
  }
  if (schema.definitions) {
    for (const [defName, defSchema] of Object.entries(schema.definitions)) {
      const def = definitions.find((x) => x.name === defName);
      if (def) {
        enhanceSchema(schema.typeName, defSchema, defName, def);
      }
    }
  }

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
    join(SchemaOutputPath, id + ".json"),
    JSON.stringify(sortedSchema, undefined, 2)
  );
}

/**
 * Join non-empty lines together with a new line character.
 */
function lines(...lines: (string | undefined)[]): string {
  return lines.filter(Boolean).join("\n");
}
