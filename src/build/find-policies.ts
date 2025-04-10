/**
 * This script goes through all the schemas and finds properties that could be
 * IAM policies. For each match, it outputs the schema and documentation to the
 * console, and asks the user what kind of policy it is. The results are stored
 * in the `policy-props.json` file in the repository root.
 */

import { loadAwsServiceSpec } from "@aws-cdk/aws-service-spec";
import type { PropertySchema, ResourceTypeSchema } from "../types.ts";
import { choose } from "./lib/ui.ts";
import {
  makeAwsDocumentationUrl,
  readPolicyFile,
  readSchemaSources,
  savePolicyFile,
} from "./lib/util.ts";

const PolicyProperty = /Policy(Document|Text)?$/;

const db = await loadAwsServiceSpec();
const policyFile = await readPolicyFile();

await processFiles();
await savePolicyFile(policyFile);

/**********/

async function addKey(
  schema: PropertySchema,
  typeName: string,
  definitionName: string | undefined,
  propertyName: string
): Promise<boolean> {
  const key = definitionName
    ? `${typeName}.${definitionName}.${propertyName}`
    : `${typeName}.${propertyName}`;

  policyFile[key] ??= "unknown";

  if (policyFile[key] === "unknown") {
    console.log(`\n--------------------`);
    console.log(
      [typeName, definitionName, propertyName].filter(Boolean).join(" ")
    );

    console.log("");
    console.log(schema);

    console.log(
      "\nDocumentation: %s\n\n%s\n",
      makeAwsDocumentationUrl(typeName, definitionName, propertyName),
      getDocs(typeName, definitionName, propertyName)
    );

    const answer = await choose(
      `Is this an IAM policy?`,
      [
        { key: "y", name: "Yes" },
        { key: "n", name: "No" },
        { key: "s", name: "Skip" },
        { key: "q", name: "Quit and save" },
      ],
      "s"
    );
    if (answer === "y") {
      policyFile[key] = "iam";
    } else if (answer === "n") {
      policyFile[key] = "other";
    } else if (answer === "q") {
      return false;
    }
  }
  return true;
}

async function processFiles(): Promise<void> {
  for await (const schema of readSchemaSources()) {
    const props = Object.entries(schema.properties);
    for (const [propertyName, propertySchema] of props) {
      const resolved = resolveSchema(schema, propertySchema);

      if (isPolicy(propertyName, resolved)) {
        const shouldContinue = await addKey(
          resolved,
          schema.typeName,
          undefined,
          propertyName
        );
        if (!shouldContinue) {
          return;
        }
      }
    }

    if (!schema.definitions) {
      continue;
    }
    for (const [defName, defSchema] of Object.entries(schema.definitions)) {
      if (!defSchema.properties) {
        continue;
      }

      const props = Object.entries(defSchema.properties);
      for (const [propertyName, propertySchema] of props) {
        const resolved = resolveSchema(schema, propertySchema);

        if (isPolicy(propertyName, resolved)) {
          const shouldContinue = await addKey(
            resolved,
            schema.typeName,
            defName,
            propertyName
          );
          if (!shouldContinue) {
            return;
          }
        }
      }
    }
  }
}

function getDocs(
  typeName: string,
  definitionName: string | undefined,
  propertyName: string
): string | undefined {
  try {
    const resource = db
      .lookup("resource", "cloudFormationType", "equals", typeName)
      .only();

    const entity = definitionName
      ? db
          .follow("usesType", resource)
          .find((x) => x.entity.name === definitionName)?.entity
      : resource;

    return entity?.properties[propertyName]?.documentation;
  } catch {}
}

function resolveSchema(
  resource: ResourceTypeSchema,
  schema: PropertySchema
): PropertySchema {
  if (!resource.definitions) {
    return schema;
  }

  let target = schema;

  while (target.$ref) {
    if (!target.$ref.startsWith("#/definitions/")) {
      break;
    }

    const name = target.$ref.slice("#/definitions/".length);
    const result = resource.definitions[name];

    if (result) {
      target = result;
    } else {
      break;
    }
  }

  return target;
}

function isPolicy(propertyName: string, schema: PropertySchema): boolean {
  if (!PolicyProperty.test(propertyName)) {
    return false;
  }
  return isPolicyLikeSchema(schema);
}

function isPolicyLikeSchema(schema: PropertySchema): boolean {
  if (schema.enum || schema.properties) {
    return false;
  }
  return (
    schema.type === "object" ||
    (Array.isArray(schema.type) && schema.type.includes("object"))
  );
}
