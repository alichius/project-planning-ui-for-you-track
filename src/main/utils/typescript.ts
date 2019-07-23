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

/**
 * Returns the given value as string if the type of the value is `string`, `boolean`, or `number`; otherwise,
 * returns the given default value.
 *
 * This function is meant to be used when we cannot trust the type system (typically, user input).
 */
export function ensureString(value: string, defaultValue: string = ''): string {
  const actualValue: unknown = value;
  switch (typeof actualValue) {
    case 'string': return actualValue;
    case 'boolean': case 'number': return actualValue.toString();
    default: return defaultValue;
  }
}

/**
 * Returns the given value if it is a number, or otherwise the given default value.
 *
 * This function is meant to be used when we cannot trust the type system (typically, user input).
 */
export function ensureNumber(value: number, defaultValue: number = 0): number {
  const actualValue: unknown = value;
  return typeof actualValue === 'number'
      ? actualValue
      : defaultValue;
}

/**
 * Returns the given value if it is a boolean, or otherwise the given default value.
 *
 * This function is meant to be used when we cannot trust the type system (typically, user input).
 */
export function ensureBoolean(value: boolean, defaultValue: boolean = false): boolean {
  const actualValue: unknown = value;
  return typeof actualValue === 'boolean'
      ? actualValue
      : defaultValue;
}

/**
 * Returns a newly created array where each element is the result of invoking `ensureElementType()`. If the given value
 * is not an array, returns the default array.
 *
 * This function is meant to be used when we cannot trust the type system (typically, user input).
 */
export function ensureArray<T>(value: T[], defaultValue: T[] = [], validElementPredicate: (element: T) => boolean):
    T[] {
  return Array.isArray(value) && value.findIndex((element) => !validElementPredicate(element)) === -1
      ? value
      : defaultValue;
}
