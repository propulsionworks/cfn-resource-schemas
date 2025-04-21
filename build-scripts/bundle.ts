/**
 * This script takes the source data from schemas/ and supplemental/ and bundles
 * them as new-line-delimited JSON files.
 */

import assert from "node:assert";
import { createWriteStream } from "node:fs";
import {
  Transform,
  type TransformCallback,
  type TransformOptions,
} from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import {
  readSchemaSources,
  readSupplementalSources,
} from "../build-lib/util.ts";
import { Bundles } from "../lib/paths.ts";

class ToNdJsonTransform extends Transform {
  public constructor(opts?: TransformOptions) {
    super({
      ...opts,
      readableObjectMode: false,
      writableObjectMode: true,
    });
  }

  public override _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    assert(typeof chunk === "object");
    callback(undefined, JSON.stringify(chunk) + "\n");
  }
}

await Promise.all([
  pipeline(
    readSchemaSources(),
    new ToNdJsonTransform(),
    createGzip({ level: 9 }),
    createWriteStream(Bundles.schemas)
  ),
  pipeline(
    readSupplementalSources(),
    new ToNdJsonTransform(),
    createGzip({ level: 9 }),
    createWriteStream(Bundles.supplemental)
  ),
]);
