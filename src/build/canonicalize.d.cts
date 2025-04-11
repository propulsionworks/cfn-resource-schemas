// canonicalize types are broken
declare module "canonicalize" {
  function serialize(input: unknown): string;
  export = serialize;
}
