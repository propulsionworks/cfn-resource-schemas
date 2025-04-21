import { PackageRoot } from "#package";
import { join } from "node:path";

export const Sources = {
  policies: join(PackageRoot, "policy-props.json"),
  schemas: join(PackageRoot, "schemas"),
  supplemental: join(PackageRoot, "supplemental"),
};

export const Bundles = {
  schemas: join(PackageRoot, "schemas.ndjson.gz"),
  supplemental: join(PackageRoot, "supplemental.ndjson.gz"),
};
