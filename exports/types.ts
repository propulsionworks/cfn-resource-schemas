export type JsonPrimitive = boolean | null | number | string;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * A {@link ResourceTypeSchema} with additional metadata.
 */
export type ResourceTypeSchemaWithMeta = {
  $id: string;
  $integrity: string;
} & ResourceTypeSchema;

/**
 * Describes the nature of data in a resource schema that doesn't have a more
 * specific type in the schema itself.
 */
export type WellKnownType = "iam-policy";

/**
 * Contains extra information about a property.
 */
export type PropertySupplemental = {
  description?: string | undefined;
  documentationUrl?: string | undefined;
  wellKnownType?: WellKnownType | undefined;
};

/**
 * Contains extra information about an object.
 */
export type ObjectSupplemental = {
  description?: string | undefined;
  documentationUrl?: string | undefined;
  properties: Record<string, PropertySupplemental>;
};

/**
 * Contains extra information about a resource and its related types.
 */
export type ResourceSupplemental = {
  attributes: ObjectSupplemental;
  definitions: Record<string, ObjectSupplemental>;
  description?: string | undefined;
  documentationUrl?: string | undefined;
  id: string;
  properties: Record<string, PropertySupplemental>;
  typeName: string;
};

export type JsonSchemaObject = {
  $comment?: string | undefined;
  $id?: string | undefined;
  $ref?: string | undefined;
  $schema?: string | undefined;
  additionalItems?: JsonSchema | undefined;
  additionalProperties?: JsonSchema | undefined;
  allOf?: JsonSchema[] | undefined;
  anyOf?: JsonSchema[] | undefined;
  const?: JsonValue;
  contains?: JsonSchema | undefined;
  contentEncoding?: string | undefined;
  contentMediaType?: string | undefined;
  default?: JsonValue;
  /**
   * @default {}
   */
  definitions?: Record<string, JsonSchema> | undefined;
  dependencies?: Record<string, JsonSchema | string[]> | undefined;
  description?: string | undefined;
  else?: JsonSchema | undefined;
  enum?: JsonValue[] | undefined;
  examples?: JsonValue[] | undefined;
  exclusiveMaximum?: number | undefined;
  exclusiveMinimum?: number | undefined;
  format?: string | undefined;
  if?: JsonSchema | undefined;
  /**
   * @default true
   */
  items?: JsonSchema | JsonSchema[] | undefined;
  /**
   * @min 0
   */
  maxItems?: number | undefined;
  /**
   * @min 0
   */
  maxLength?: number | undefined;
  /**
   * @min 0
   */
  maxProperties?: number | undefined;
  maximum?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minItems?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minLength?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minProperties?: number | undefined;
  minimum?: number | undefined;
  multipleOf?: number | undefined;
  not?: JsonSchema | undefined;
  oneOf?: JsonSchema[] | undefined;
  pattern?: string | undefined;
  /**
   * @default {}
   */
  patternProperties?: Record<string, JsonSchema> | undefined;
  /**
   * @default {}
   */
  properties?: Record<string, JsonSchema> | undefined;
  propertyNames?: JsonSchema | undefined;
  /**
   * @default false
   */
  readOnly?: boolean | undefined;
  /**
   * @default []
   */
  required?: string[] | undefined;
  then?: JsonSchema | undefined;
  title?: string | undefined;
  type?: JsonSchemaType | JsonSchemaType[] | undefined;
  /**
   * @default false
   */
  uniqueItems?: boolean | undefined;
  /**
   * @default false
   */
  writeOnly?: boolean | undefined;
};

export type JsonSchema = JsonSchemaObject | boolean;

export type JsonSchemaType =
  | "array"
  | "boolean"
  | "integer"
  | "null"
  | "number"
  | "object"
  | "string";

/**
 * This schema validates a CloudFormation resource provider definition.
 */
export type ResourceTypeSchema = {
  $comment?: string | undefined;
  $schema?: string | undefined;
  /**
   * An optional list of supplementary identifiers, each of which uniquely identifies an instance of this resource type. An identifier is a non-zero-length list of JSON pointers to properties that form a single key. An identifier can be a single or multiple properties to support composite-key identifiers.
   */
  additionalIdentifiers?: string[][] | undefined;
  additionalProperties: false;
  allOf?: PropertySchema[] | undefined;
  anyOf?: PropertySchema[] | undefined;
  /**
   * A list of JSON pointers for properties that can only be updated under certain conditions. For example, you can upgrade the engine version of an RDS DBInstance but you cannot downgrade it.  When updating this property for a resource in a CloudFormation stack, the resource will be replaced if it cannot be updated.
   */
  conditionalCreateOnlyProperties?: string[] | undefined;
  /**
   * A list of JSON pointers to properties that are only able to be specified by the customer when creating a resource. Conversely, any property *not* in this list can be applied to an Update request.
   */
  createOnlyProperties?: string[] | undefined;
  definitions?: Record<string, PropertySchema> | undefined;
  /**
   * A list of JSON pointers to properties that have been deprecated by the underlying service provider. These properties are still accepted in create & update operations, however they may be ignored, or converted to a consistent model on application. Deprecated properties are not guaranteed to be present in read paths.
   */
  deprecatedProperties?: string[] | undefined;
  description: string;
  /**
   * @maxLength 4096
   * @pattern ^https://[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])(:[0-9]*)*([?/#].*)?$
   */
  documentationUrl?: string | undefined;
  /**
   * Defines the provisioning operations which can be performed on this resource type
   */
  handlers?: ResourceHandlers | undefined;
  /**
   * A list of JSON pointers for definitions that are hidden. These definitions will still be used but will not be visible
   */
  nonPublicDefinitions?: string[] | undefined;
  /**
   * A list of JSON pointers for properties that are hidden. These properties will still be used but will not be visible
   */
  nonPublicProperties?: string[] | undefined;
  oneOf?: PropertySchema[] | undefined;
  /**
   * A required identifier which uniquely identifies an instance of this resource type. An identifier is a non-zero-length list of JSON pointers to properties that form a single key. An identifier can be a single or multiple properties to support composite-key identifiers.
   */
  primaryIdentifier: string[];
  properties: Record<string, PropertySchema>;
  /**
   * A map which allows resource owners to define a function for a property with possible transformation. This property helps ensure the input to the model is equal to output
   */
  propertyTransform?: Record<string, string> | undefined;
  /**
   * A list of JSON pointers to properties that are able to be found in a Read request but unable to be specified by the customer
   */
  readOnlyProperties?: string[] | undefined;
  /**
   * Reserved for CloudFormation use. A namespace to inline remote schemas.
   */
  remote?: Record<string, RemoteSchema> | undefined;
  replacementStrategy?: ReplacementStrategy | undefined;
  /**
   * @default []
   */
  required?: string[] | undefined;
  /**
   * A template-able link to a resource instance. AWS-internal service links must be relative to the AWS console domain. External service links must be absolute, HTTPS URIs.
   */
  resourceLink?: ResourceLink | undefined;
  /**
   * @maxLength 4096
   * @pattern ^https://[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])(:[0-9]*)*([?/#].*)?$
   */
  sourceUrl?: string | undefined;
  /**
   * (Deprecated, please use new metadata attribute tagging) A boolean flag indicating whether this resource type supports tagging.
   * @default true
   */
  taggable?: boolean | undefined;
  tagging?: ResourceTagging | undefined;
  title?: string | undefined;
  type?: "RESOURCE" | undefined;
  /**
   * TypeConfiguration to set the configuration data for registry types. This configuration data is not passed through the resource properties in template. One of the possible use cases is configuring auth keys for 3P resource providers.
   */
  typeConfiguration?: TypeConfiguration | undefined;
  /**
   * @pattern ^[a-zA-Z0-9]{2,64}::[a-zA-Z0-9]{2,64}::[a-zA-Z0-9]{2,64}$
   */
  typeName: string;
  /**
   * A list of JSON pointers to properties (typically sensitive) that are able to be specified by the customer but unable to be returned in a Read request
   */
  writeOnlyProperties?: string[] | undefined;
};

/**
 * Defines the provisioning operations which can be performed on this resource type
 */
export type ResourceHandlers = {
  create?: HandlerDefinition | undefined;
  delete?: HandlerDefinition | undefined;
  list?: HandlerDefinitionWithSchemaOverride | undefined;
  read?: HandlerDefinition | undefined;
  update?: HandlerDefinition | undefined;
};

export type ResourceTagging = {
  /**
   * A boolean flag indicating whether this resource type supports CloudFormation system tags.
   * @default true
   */
  cloudFormationSystemTags?: boolean | undefined;
  permissions?: string[] | undefined;
  /**
   * A boolean flag indicating whether this resource type supports tagging resources upon creation.
   * @default true
   */
  tagOnCreate?: boolean | undefined;
  /**
   * A reference to the Tags property in the schema.
   * @default /properties/Tags
   */
  tagProperty?: string | undefined;
  /**
   * A boolean flag indicating whether this resource type supports updatable tagging.
   * @default true
   */
  tagUpdatable?: boolean | undefined;
  /**
   * A boolean flag indicating whether this resource type supports tagging.
   * @default true
   */
  taggable: boolean;
};

/**
 * Reserved for CloudFormation use. A inlined remote schema.
 */
export type RemoteSchema = {
  $comment?: string | undefined;
  definitions?: Record<string, PropertySchema> | undefined;
  properties?: Record<string, PropertySchema> | undefined;
};

export type PropertySchema = {
  $comment?: string | undefined;
  $ref?: string | undefined;
  additionalProperties?: false | undefined;
  allOf?: PropertySchema[] | undefined;
  anyOf?: PropertySchema[] | undefined;
  /**
   * When set to AttributeList, it indicates that the array is of nested type objects, and when set to Standard it indicates that the array consists of primitive types
   * @default Standard
   */
  arrayType?: "Standard" | "AttributeList" | undefined;
  const?: JsonValue;
  /**
   * @default true
   */
  contains?: JsonSchema | undefined;
  default?: JsonValue;
  dependencies?: Record<string, PropertySchema | string[]> | undefined;
  description?: string | undefined;
  enum?: JsonValue[] | undefined;
  examples?: JsonValue[] | undefined;
  exclusiveMaximum?: number | undefined;
  exclusiveMinimum?: number | undefined;
  format?: string | undefined;
  /**
   * When set to true, this flag indicates that the order of insertion of the array will be honored, and that changing the order of the array would indicate a diff
   * @default true
   */
  insertionOrder?: boolean | undefined;
  /**
   * @default {}
   */
  items?: PropertySchema | undefined;
  /**
   * @min 0
   */
  maxItems?: number | undefined;
  /**
   * @min 0
   */
  maxLength?: number | undefined;
  /**
   * @min 0
   */
  maxProperties?: number | undefined;
  maximum?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minItems?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minLength?: number | undefined;
  /**
   * @min 0
   * @default 0
   */
  minProperties?: number | undefined;
  minimum?: number | undefined;
  multipleOf?: number | undefined;
  oneOf?: PropertySchema[] | undefined;
  pattern?: string | undefined;
  patternProperties?: Record<string, PropertySchema> | undefined;
  properties?: Record<string, PropertySchema> | undefined;
  relationshipRef?: RelationshipRef | undefined;
  /**
   * @default []
   */
  required?: string[] | undefined;
  title?: string | undefined;
  type?: JsonSchemaType | JsonSchemaType[] | undefined;
  /**
   * @default false
   */
  uniqueItems?: boolean | undefined;
};

export type RelationshipRef = {
  /**
   * @min 1
   * @max 10000
   */
  majorVersion?: number | undefined;
  /**
   * @pattern ^(/properties/)[A-Za-z0-9]*$
   */
  propertyPath: string;
  /**
   * @pattern [0-9a-zA-Z]{12,40}
   */
  publisherId?: string | undefined;
  /**
   * @pattern ^[a-zA-Z0-9]{2,64}::[a-zA-Z0-9]{2,64}::[a-zA-Z0-9]{2,64}$
   */
  typeName: string;
};

/**
 * This schema validates a CloudFormation type provider configuration definition.
 */
export type TypeConfiguration = {
  additionalProperties: false;
  allOf?: PropertySchema[] | undefined;
  anyOf?: PropertySchema[] | undefined;
  /**
   * A list of JSON pointers to properties that have been deprecated by the underlying service provider. These properties are still accepted in create & update operations, however they may be ignored, or converted to a consistent model on application. Deprecated properties are not guaranteed to be present in read paths.
   */
  deprecatedProperties?: string[] | undefined;
  description?: string | undefined;
  oneOf?: PropertySchema[] | undefined;
  properties: Record<string, PropertySchema>;
  /**
   * @default []
   */
  required?: string[] | undefined;
};

/**
 * The valid replacement strategies are [create_then_delete] and [delete_then_create]. All other inputs are invalid.
 */
export type ReplacementStrategy = "create_then_delete" | "delete_then_create";

export type ResourceLink = {
  $comment?: string | undefined;
  mappings: Record<string, string>;
  /**
   * @pattern ^(/|https:)
   */
  templateUri: string;
};

/**
 * Defines any execution operations which can be performed on this resource provider
 */
export type HandlerDefinition = {
  permissions: string[];
  /**
   * Defines the timeout for the entire operation to be interpreted by the invoker of the handler.  The default is 120 (2 hours).
   * @min 2
   * @max 2160
   * @default 120
   */
  timeoutInMinutes?: number | undefined;
};

/**
 * Defines any execution operations which can be performed on this resource provider
 */
export type HandlerDefinitionWithSchemaOverride = {
  handlerSchema?: HandlerSchema | undefined;
  permissions: string[];
  /**
   * Defines the timeout for the entire operation to be interpreted by the invoker of the handler.  The default is 120 (2 hours).
   * @min 2
   * @max 2160
   * @default 120
   */
  timeoutInMinutes?: number | undefined;
};

export type HandlerSchema = {
  allOf?: PropertySchema[] | undefined;
  anyOf?: PropertySchema[] | undefined;
  oneOf?: PropertySchema[] | undefined;
  properties: Record<string, PropertySchema>;
  /**
   * @default []
   */
  required?: string[] | undefined;
};
