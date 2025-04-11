import { PackageJson } from "#package";
import { ProcessOutput, $ as zx } from "zx";

process.on("uncaughtException", (error) => {
  if (error instanceof ProcessOutput) {
    // don't double log the exception
    console.error(`stopping due to error`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

if (process.stdout.isTTY) {
  process.env["FORCE_COLOR"] = "1";
}

zx.verbose = true;
const $ = zx.sync;
const $nothrow = $({ nothrow: true });

// a minor version increment is considered breaking if version is 0.minor.patch
const minorIncrement = PackageJson.version.startsWith("0.") ? "patch" : "minor";

// download the latest schemas
$`npm run download`;

// install the latest version of @aws-cdk/aws-service-spec to provide supplemental data
$`npm update @aws-cdk/aws-service-spec`;

// pull supplemental data into the supplemental/*.json files
$`npm run supplemental`;

// create the bundle files
$`npm run bundle`;

// bail early if nothing changed
if ($nothrow`git diff-index --quiet HEAD --`.ok) {
  console.log(`No changes, nothing to do!`);
  process.exit(0);
}

// build and test
$`npm run compile`;
$`npm run test`;

// stop here if we're just building
if (process.argv.includes("--build-only")) {
  console.log(`Option --build-only given, stopping early`);
  process.exit(0);
}

// commit changes
$`git add -A && git commit -m "update schemas"`;

// version bump
$`npm version ${minorIncrement}`;

// publish
if (process.argv.includes("--dry-run")) {
  $`npm publish --dry-run`;
} else {
  $`git push --follow-tags`;
  $`npm publish`;
}
