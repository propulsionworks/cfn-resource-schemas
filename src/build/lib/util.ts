import canonicalize from "canonicalize";
import assert from "node:assert";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format, resolveConfig } from "prettier";
import { Sources } from "../../paths.ts";
import type {
  ResourceSupplemental,
  ResourceTypeSchemaWithMeta,
} from "../../types.ts";

export const Attributes = Symbol();
export type Attributes = typeof Attributes;

export type PolicyType = "iam" | "other" | "unknown";
export type PolicyFile = Record<string, PolicyType>;

/**
 * Construct a URL for AWS web documentation.
 */
export function makeAwsDocumentationUrl(
  typeName: string,
  definitionName?: string | Attributes,
  propertyName?: string
): string | undefined {
  const match = /^(?:aws|alexa)::(.+)::([^.]+)$/.exec(typeName.toLowerCase());
  if (!match) {
    return;
  }

  const service = match[1];
  const resource = match[2];
  assert(service && resource);

  let page: string;
  let fragment = "";

  if (typeof definitionName === "string") {
    page = `aws-properties-${service}-${resource}-${definitionName.toLowerCase()}`;
  } else {
    page = `aws-resource-${service}-${resource}`;
  }

  if (definitionName === Attributes) {
    // attributes
    fragment = `#aws-resource-${service}-${resource}-return-values`;
  } else if (propertyName !== undefined) {
    if (typeof definitionName === "string") {
      fragment = `#cfn-${service}-${resource}-${definitionName.toLowerCase()}-${propertyName.toLowerCase()}`;
    } else {
      fragment = `#cfn-${service}-${resource}-${propertyName.toLowerCase()}`;
    }
  }

  return `https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/${page}.html${fragment}`;
}

/**
 * Read the policy information file.
 */
export async function readPolicyFile(
  path = Sources.policies
): Promise<PolicyFile> {
  try {
    return JSON.parse(await readFile(path, "utf-8")) as PolicyFile;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

/**
 * Read all the resource schemas.
 */
export async function* readSchemaSources(
  path = Sources.schemas
): AsyncIterable<ResourceTypeSchemaWithMeta> {
  const fileNames = await readdir(path);
  fileNames.sort();

  for (const fileName of fileNames) {
    const json = await readFile(join(path, fileName), "utf8");
    yield JSON.parse(json);
  }
}

/**
 * Read all the resource schemas.
 */
export async function* readSupplemental(
  path = Sources.supplemental
): AsyncIterable<ResourceSupplemental> {
  const fileNames = await readdir(path);
  fileNames.sort();

  for (const fileName of fileNames) {
    const json = await readFile(join(path, fileName), "utf8");
    yield JSON.parse(json);
  }
}

/**
 * Read the policy information file.
 */
export async function savePolicyFile(
  data: PolicyFile,
  path = Sources.policies
): Promise<void> {
  await writeJsonFile(path, data, true);
}

/**
 * Save the file after transforming with prettier.
 */
export async function writeFileWithFormatting(
  path: string,
  data: string
): Promise<void> {
  const options = await resolveConfig(path);

  await writeFile(
    path,
    await format(data, {
      ...options,
      filepath: path,
    })
  );
}

/**
 * Writes formatted JSON to the given path.
 */
export async function writeJsonFile(
  path: string,
  data: Record<string, unknown>,
  canonical = false
): Promise<void> {
  // Node preserves order of keys in object so we apply canonicalization and
  // formatting in the easiest way by canonicalizing, re-parsing, and formatting
  await writeFileWithFormatting(
    path,
    JSON.stringify(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      canonical ? JSON.parse(canonicalize(data)!) : data,
      undefined,
      2
    )
  );
}
