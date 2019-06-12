export function deepEquals<T>(left: T, right: T): boolean {
  if (Object.is(left, right)) {
    return true;
  } else if (typeof left !== typeof right) {
    return false;
  }

  if (Array.isArray(left)) {
    if (!Array.isArray(right)) {
      return false;
    }
    if (left.length !== right.length) {
      return false;
    }
    const length = left.length;
    for (let i = 0; i < length; ++i) {
      if (!deepEquals(left[i], right[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof left === 'object') {
    const leftKeys: string[] = Object.keys(left);
    const rightKeys: string[] = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const leftKey of leftKeys) {
      if (!(right as {}).hasOwnProperty(leftKey) ||
          !deepEquals((left as Record<string, any>)[leftKey], (right as Record<string, any>)[leftKey])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
