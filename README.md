# @propulsionworks/cfn-resource-schemas

This repository contains the [CloudFormation resource provider schemas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-type-schemas.html) for the `us-east-1` region.

The schemas are checked weekly (on Monday) for changes, and if there are any, a new version of this package is automatically published.

## Usage

### Schemas

The resource schemas are available via `loadSchemas()`. These are as-published by Amazon, with two additional fields:

- `$id`: the original filename, without the `.json` extension
- `$integrity`: an [Subresource Integrity](https://w3c.github.io/webappsec-subresource-integrity/) value for the schema (excluding `$id` and `$integrity` attributes)

```typescript
import { loadSchemas } from "@propulsionworks/cfn-resource-schemas";
import { ResourceTypeSchemaWithMeta } from "@propulsionworks/cfn-resource-schemas/types";

const schemas = loadSchemas();

for await (const schema of schemas) {
  // schema is a ResourceTypeSchemaWithMeta
}
```

### Supplemental

Extra data is available via `loadSupplemental()`. This contains improved documentation (sourced from [@aws-cdk/aws-service-spec](https://www.npmjs.com/package/@aws-cdk/aws-service-spec)) and a field `wellKnownType` for some properties that provides more information about the property type not available in the resource schema. At present, the only possible value for this field is `"iam-policy"`, which means that the field should contain a [IAM Policy document](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html).

For each resource, definition, and property, a `documentationUrl` value is provided, containing a generated link to the AWS documentation (e.g. [`AWS::Lambda::Function`](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html)).

```typescript
import { loadSupplemental } from "@propulsionworks/cfn-resource-schemas";
import { ResourceSupplemental } from "@propulsionworks/cfn-resource-schemas/types";

const resources = loadSupplemental();

for await (const resource of resources) {
  // resource is a ResourceSupplemental
}
```

The supplemental data has the following shape:

```typescript
export type ResourceSupplemental = {
  attributes: ObjectSupplemental;
  definitions: Record<string, ObjectSupplemental>;
  description?: string | undefined;
  documentationUrl?: string | undefined;
  properties: Record<string, PropertySupplemental>;
  typeName: string;
};

export type ObjectSupplemental = {
  description?: string | undefined;
  documentationUrl?: string | undefined;
  properties: Record<string, PropertySupplemental>;
};

export type PropertySupplemental = {
  description?: string | undefined;
  documentationUrl?: string | undefined;
  wellKnownType?: WellKnownType | undefined;
};

export type WellKnownType = "iam-policy";
```
