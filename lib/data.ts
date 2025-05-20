import { createReadStream } from "node:fs";
import { pipeline } from "node:stream";
import { createGunzip } from "node:zlib";
import type {
  ResourceSupplemental,
  ResourceTypeSchemaWithMeta,
} from "../exports/types.ts";
import { Bundles } from "./paths.ts";
import { FromNdJsonTransform } from "./stream.ts";

/**
 * Load the AWS schemas from the bundle.
 */
export function loadSchemas(): AsyncIterable<
  ResourceTypeSchemaWithMeta,
  void,
  void
> {
  return pipeline(
    createReadStream(Bundles.schemas),
    createGunzip(),
    new FromNdJsonTransform(),
    () => {}
  );
}

/**
 * Load the AWS schemas from the bundle.
 */
export function loadSupplemental(): AsyncIterable<
  ResourceSupplemental,
  void,
  void
> {
  return pipeline(
    createReadStream(Bundles.supplemental),
    createGunzip(),
    new FromNdJsonTransform(),
    () => {}
  );
}
