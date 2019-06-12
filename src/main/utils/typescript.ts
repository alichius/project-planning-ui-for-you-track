export function unreachableCase(x: never): never {
  throw new Error(`Unexpected case that should be unreachable: ${x}`);
}
