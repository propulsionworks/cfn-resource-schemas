import { createReadStream } from "node:fs";
import { join } from "node:path";
import { type TransformCallback, Transform } from "node:stream";
import { StringDecoder } from "node:string_decoder";
import { createGunzip } from "node:zlib";
import type { ResourceTypeSchemaWithMeta } from "./types.ts";

/**
 * Stream transform to convert the input into a stream of JSON objects.
 */
class NdJsonTransform extends Transform {
  readonly #decoder = new StringDecoder();
  #last = "";

  public constructor() {
    super({
      readableObjectMode: true,
    });
  }

  public override _transform(
    chunk: string | Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    const current = this.#last + this.#decoder.write(chunk);
    const lines = current.split(`\n`);
    this.#last = lines.pop() ?? "";

    for (const line of lines) {
      this.push(JSON.parse(line));
    }
    callback();
  }

  public override _flush(callback: TransformCallback): void {
    const current = this.#last + this.#decoder.end();
    callback(undefined, current ? JSON.parse(current) : undefined);
  }
}

/**
 * Load the AWS schemas from the bundle.
 */
export function loadSchemas(): AsyncIterable<
  ResourceTypeSchemaWithMeta,
  void,
  void
> {
  return createReadStream(join(import.meta.dirname, "../schemas.ndjson.gz"))
    .pipe(createGunzip())
    .pipe(new NdJsonTransform());
}
