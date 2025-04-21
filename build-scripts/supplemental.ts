/**
 * This script outputs supplemental data about resource schemas in the
 * `supplemental/` folder. Currently this data includes:
 *
 *   - improved documentation from the `@aws-cdk/aws-service-spec` package
 *   - supplemental type info (currently limited to IAM Policy)
 *
 */

import { loadAwsServiceSpec } from "@aws-cdk/aws-service-spec";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  Attributes,
  makeAwsDocumentationUrl,
  readPolicyFile,
  readSchemaSources,
  writeJsonFile,
} from "../build-lib/util.ts";
import type {
  ObjectSupplemental,
  ResourceSupplemental,
} from "../exports/types.ts";
import { Sources } from "../lib/paths.ts";

await mkdir(Sources.supplemental, { recursive: true });

const db = await loadAwsServiceSpec();
const policyFile = await readPolicyFile();

for await (const schema of readSchemaSources()) {
  const id = schema.typeName.replaceAll("::", "-").toLowerCase();
  const outputPath = join(Sources.supplemental, `${id}.json`);

  const dbResource = db.lookup(
    "resource",
    "cloudFormationType",
    "equals",
    schema.typeName
  )[0];

  const output: ResourceSupplemental = {
    attributes: {
      documentationUrl: makeAwsDocumentationUrl(schema.typeName, Attributes),
      properties: {},
    },
    definitions: {},
    description: dbResource?.documentation,
    id,
    properties: {},
    typeName: schema.typeName,
  };

  if (dbResource) {
    const props = Object.entries(dbResource.attributes);
    for (const [propertyName, property] of props) {
      output.attributes.properties[propertyName] = {
        description: property.documentation,
      };
    }
  }

  for (const propertyName of Object.keys(schema.properties)) {
    const dbProperty = dbResource?.properties[propertyName];
    const policyFileEntry = policyFile[`${schema.typeName}.${propertyName}`];

    output.properties[propertyName] = {
      description: dbProperty?.documentation,
      documentationUrl: makeAwsDocumentationUrl(
        schema.typeName,
        undefined,
        propertyName
      ),
      wellKnownType: policyFileEntry === "iam" ? "iam-policy" : undefined,
    };
  }

  if (schema.definitions) {
    const dbDefinitions = dbResource
      ? db.follow("usesType", dbResource).map((x) => x.entity)
      : [];

    const definitions = Object.entries(schema.definitions);

    for (const [definitionName, definitionSchema] of definitions) {
      const dbDef = dbDefinitions.find((x) => x.name === definitionName);

      const defDocs: ObjectSupplemental = {
        properties: {},
        description: dbDef?.documentation,
        documentationUrl: makeAwsDocumentationUrl(
          schema.typeName,
          definitionName
        ),
      };
      output.definitions[definitionName] = defDocs;

      if (definitionSchema.properties) {
        for (const propertyName of Object.keys(definitionSchema.properties)) {
          const dbProp = dbDef?.properties[propertyName];
          const policyFileEntry =
            policyFile[`${schema.typeName}.${definitionName}.${propertyName}`];

          defDocs.properties[propertyName] = {
            description: dbProp?.documentation,
            documentationUrl: makeAwsDocumentationUrl(
              schema.typeName,
              definitionName,
              propertyName
            ),
            wellKnownType: policyFileEntry === "iam" ? "iam-policy" : undefined,
          };
        }
      }
    }
  }

  await writeJsonFile(outputPath, output);
}
