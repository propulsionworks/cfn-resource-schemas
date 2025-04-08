import { PackageRoot } from "#package";
import { createWriteStream } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const SchemaPath = resolve(PackageRoot, "./schemas");
const OutputFile = resolve(PackageRoot, "./schemas.ndjson.gz");

async function* readSchemas(path: string): AsyncIterable<string> {
  const fileNames = await readdir(path);
  fileNames.sort();

  for (const fileName of fileNames) {
    const json = await readFile(join(path, fileName), "utf8");
    // parse and re-stringify with no formatting
    yield JSON.stringify(JSON.parse(json)) + "\n";
  }
}

await pipeline(
  readSchemas(SchemaPath),
  createGzip({ level: 9 }),
  createWriteStream(OutputFile)
);
