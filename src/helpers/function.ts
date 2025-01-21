export const stringifyCircular = (obj: object): string => {
  const seen = new WeakSet();

  return JSON.stringify(obj, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return; // Discard key if it's a circular reference
      }
      seen.add(value);
    }
    return value;
  });
};

export const containsGameObjectValue = (
  obj: unknown,
  targetValue: unknown,
  maxDepth: number,
  currentDepth = 0
): boolean => {
  if (currentDepth > maxDepth) {
    return false; // Exceeded maximum depth
  }

  if (obj === targetValue) {
    return true;
  }

  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (containsGameObjectValue(item, targetValue, maxDepth, currentDepth + 1)) {
          return true;
        }
      }
    } else if (obj instanceof Object) {
      for (const key of Object.keys(obj)) {
        const value = (obj as Record<string, unknown>)[key];
        if (containsGameObjectValue(value, targetValue, maxDepth, currentDepth + 1)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const isEnumValue = <T extends Record<string | number, string | number>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] => {
  return Object.values(enumObj).includes(value as T[keyof T]);
};
