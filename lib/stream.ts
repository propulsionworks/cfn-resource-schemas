import { type TransformCallback, Transform } from "node:stream";
import { StringDecoder } from "node:string_decoder";

/**
 * Stream transform to convert the input into a stream of JSON objects.
 */
export class FromNdJsonTransform extends Transform {
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
