import { loadSchemas } from "@propulsionworks/cfn-resource-schemas";
import type { ResourceTypeSchemaWithMeta } from "@propulsionworks/cfn-resource-schemas/types";
import canonicalize from "canonicalize";
import assert from "node:assert";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { checkData } from "ssri";

// extract all the schemas, compare with local, check the integrity

async function* loadLocalSchemas(
  path = "./schemas"
): AsyncIterable<string, void, void> {
  const localFileNames = await readdir(path);
  localFileNames.sort();

  for (const fileName of localFileNames) {
    yield await readFile(join(path, fileName), "utf-8");
  }
}

const localSchemas = loadLocalSchemas()[Symbol.asyncIterator]();
const bundleSchemas = loadSchemas()[Symbol.asyncIterator]();

let count = 0;

for (; ; ++count) {
  const localResult = await localSchemas.next();
  const bundledResult = await bundleSchemas.next();

  if (localResult.value === undefined) {
    assert.strictEqual(
      bundledResult.value,
      undefined,
      "bundle has extra schemas"
    );
    break;
  }
  assert(bundledResult.value, "bundle is missing schemas");

  const local = JSON.parse(localResult.value) as ResourceTypeSchemaWithMeta;
  const bundled = bundledResult.value;

  assert.deepStrictEqual(bundled, local);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $id, $integrity, ...bundledWithoutMeta } = bundled;

  assert(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    checkData(canonicalize(bundledWithoutMeta)!, $integrity),
    "integrity check failed"
  );
}

console.log(`checked ${count} schemas`);
