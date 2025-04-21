import canonicalize from "canonicalize";
import assert from "node:assert";
import { checkData } from "ssri";
import { chalk } from "zx";
import {
  readSchemaSources,
  readSupplementalSources,
} from "../build-lib/util.ts";
import { loadSchemas, loadSupplemental } from "../exports/main.ts";

// extract all the schemas, compare with local, check the integrity

const localSchemas = readSchemaSources()[Symbol.asyncIterator]();
const bundleSchemas = loadSchemas()[Symbol.asyncIterator]();

const missingSupplemental = new Set<string>();

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

  const local = localResult.value;
  const bundled = bundledResult.value;
  missingSupplemental.add(local.typeName);

  assert.deepStrictEqual(bundled, local);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $id, $integrity, ...bundledWithoutMeta } = bundled;

  assert(
    checkData(canonicalize(bundledWithoutMeta), $integrity),
    "integrity check failed"
  );
}

console.log(`checked ${count} schemas`);

const localSupplemental = readSupplementalSources()[Symbol.asyncIterator]();
const bundleSupplemental = loadSupplemental()[Symbol.asyncIterator]();

for (count = 0; ; ++count) {
  const localResult = await localSupplemental.next();
  const bundledResult = await bundleSupplemental.next();

  if (localResult.value === undefined) {
    assert.strictEqual(
      bundledResult.value,
      undefined,
      "bundle has extra supplemental files"
    );
    break;
  }
  assert(bundledResult.value, "bundle is missing supplemental files");

  const local = localResult.value;
  const bundled = bundledResult.value;

  if (!missingSupplemental.delete(local.typeName)) {
    console.error(
      `${chalk.yellow(`warn`)} extra supplemental file without schema for ${local.typeName}`
    );
  }

  assert.deepStrictEqual(bundled, local);
}

for (const missing of missingSupplemental) {
  console.error(
    `${chalk.yellow(`warn`)} missing supplemental file for ${missing}`
  );
}

console.log(`checked ${count} supplemental files`);
