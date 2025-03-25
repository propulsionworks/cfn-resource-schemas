# @propulsionworks/cfn-resource-schemas

This repository contains the [CloudFormation resource provider schemas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-type-schemas.html) for the `us-east-1` region.

The schemas are checked daily for changes, and if there are any, a new version of this package is automatically published.

## Usage

```typescript
import { loadSchemas } from "@propulsionworks/cfn-resource-schemas";
import { ResourceTypeSchemaWithMeta } from "@propulsionworks/cfn-resource-schemas/types";

const schemas = loadSchemas();

for await (const schema of schemas) {
  // schema is a ResourceTypeSchemaWithMeta
}
```
