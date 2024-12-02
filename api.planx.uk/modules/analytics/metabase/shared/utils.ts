/**
 * Converts object keys from camelCase to snake_case
 */
export function toSnakeCase<T extends object>(obj: T): Record<string, unknown> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      acc[snakeKey] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

/**
 * Converts object keys from snake_case to camelCase
 */
export function toCamelCase<T extends object>(obj: T): Record<string, unknown> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      acc[camelKey] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}
