import assert from "node:assert";

export function getDocumentationUrl(
  typeName: string,
  definitionName?: string | null,
  propertyName?: string
): string | undefined {
  const match = /^(?:aws|alexa)::(.+)::([^.]+)$/.exec(typeName.toLowerCase());
  if (!match) {
    return;
  }

  const service = match[1];
  const resource = match[2];
  assert(service && resource);

  let page: string;
  let fragment = "";

  if (typeof definitionName === "string") {
    page = `aws-properties-${service}-${resource}-${definitionName.toLowerCase()}`;
  } else {
    page = `aws-resource-${service}-${resource}`;
  }

  if (definitionName === null) {
    // attributes
    fragment = `#aws-resource-${service}-${resource}-return-values`;
  } else if (propertyName !== undefined) {
    if (typeof definitionName === "string") {
      fragment = `#cfn-${service}-${resource}-${definitionName.toLowerCase()}-${propertyName.toLowerCase()}`;
    } else {
      fragment = `#cfn-${service}-${resource}-${propertyName.toLowerCase()}`;
    }
  }

  return `https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/${page}.html${fragment}`;
}
