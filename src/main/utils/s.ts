import { SDataArray } from 's-array';
import { DataSignal } from 's-js';

export interface Jsonable {
  toJSON(): any;
}

/**
 * Makes an s.js signal jsonable by adding a `toJSON` method that extracts its value during JSONization.
 *
 * Adapted from GitHub project
 * [adamhaile/surplus-todomvc](https://github.com/adamhaile/surplus-todomvc/blob/37ffcdfca66a11365ff88aeed5db9f38b97ba2c6/src/models.ts).
 */
export function jsonable<T extends () => any>(s: T): T & Jsonable {
  const augmentedSignal = s as T & Jsonable;
  augmentedSignal.toJSON = toJSON;
  return augmentedSignal;
}

function toJSON(this: () => any): any {
  const value: any = this();
  // A good idea here would be to check if value.toJSON exists. But this is not public API, and we don't need this in
  // this project.
  if (value instanceof Set) {
    return [...value];
  } else {
    return value;
  }
}

/**
 * Creates a new plain JSON value for the given value (which may contain signals or `Set` instances).
 */
export function toPlain<T>(source: T): Plain<T> {
  if (typeof source === 'function' && 'toJSON' in source) {
    return toPlain(source());
  } else if (Array.isArray(source)) {
    return source.map(toPlain) as Plain<T>;
  } else if (source instanceof Set) {
    return toPlain(Array.from(source)) as Plain<T>;
  } else if (typeof source === 'object' && source !== null) {
    const typedSource: Record<string, any> = source;
    const target: Record<string, any> = {};
    for (const key in typedSource) {
      if (typedSource.hasOwnProperty(key) && key !== 'transient') {
        const plainValue = toPlain(typedSource[key]);
        if (plainValue !== undefined) {
          target[key] = plainValue;
        }
      }
    }
    return target as Plain<T>;
  } else {
    return source as Plain<T>;
  }
}

// The following requires at least TypeScript 3.4. See: https://github.com/Microsoft/TypeScript/issues/24622
type PlainHelper<T> =
    T extends SDataArray<infer U1> ? U1[] :
    T extends DataSignal<infer U2> ? U2 :
    T extends Set<infer U3> ? U3[] :
    T extends ({[P in keyof T]: T[P]} & {transient: any}) ? {[P in Exclude<keyof T, 'transient'>]: PlainHelper<T[P]>} :
    T extends {[P in keyof T]: T[P]} ? {[P in keyof T]: PlainHelper<T[P]>} :
    T;

export type Plain<T> = PlainHelper<PlainHelper<PlainHelper<T>>>;
