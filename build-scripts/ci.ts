import { PackageJson } from "#package";
import { ProcessOutput, $ as zx } from "zx";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      GITHUB_EVENT_NAME: string;
    }
  }
}

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

const isDispatch = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";

// download the latest schemas
$`npm run download`;

// install the latest version of @aws-cdk/aws-service-spec to provide supplemental data
$`npm update @aws-cdk/aws-service-spec`;

// pull supplemental data into the supplemental/*.json files
$`npm run supplemental`;

// create the bundle files
$`npm run bundle`;

if ($nothrow`git diff-index --quiet HEAD --`.ok && !isDispatch) {
  // bail early if nothing changed
  console.log(`No changes, nothing to do!`);
} else {
  // build and test
  $`npm run compile`;
  $`npm run test`;

  if (process.argv.includes("--build-only")) {
    // stop here if we're just building
    console.log(`Option --build-only given, stopping early`);
  } else {
    // commit changes (should only fail if isDispatch is true due to check above)
    $nothrow`git add -A && git commit -m "update schemas"`;

    // version bump
    $`npm version ${minorIncrement}`;

    // publish
    if (process.argv.includes("--dry-run")) {
      $`npm publish --dry-run`;
    } else {
      $`git push --follow-tags`;
      $`npm publish`;
    }
  }
}
