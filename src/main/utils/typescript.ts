/**
 * Function that always throws an error.
 *
 * The purpose of this function is to be used as a compile-time type completeness check; for instance, in a `switch`
 * statement. Calling this function will cause no error *only if* control-flow-based type analysis infers the argument
 * type as `never` – in other words, if the function call cannot be reached.
 */
export function unreachableCase(x: never): never {
  throw new Error(`Unexpected case that should be unreachable: ${x}`);
}
