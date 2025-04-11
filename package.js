import { readFileSync } from "node:fs";

/**
 * The root folder of the package.
 * @type {string}
 */
export const PackageRoot = import.meta.dirname;

/**
 * The contents of package.json.
 */
export const PackageJson = JSON.parse(readFileSync("./package.json"));
