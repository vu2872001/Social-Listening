export function excludeData<T, Key extends keyof T>(
  data: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete data[key];
  }
  return data;
}
