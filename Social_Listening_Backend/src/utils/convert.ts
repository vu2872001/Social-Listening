export function ConvertObjectToArray(obj: object) {
  return Object.values(obj);
}

export function toDTO<T>(data: object, DTO: new () => T): T {
  const instance = Object.create(DTO.prototype);
  const keys = Object.keys(data);
  for (const key of keys) {
    if (instance.hasOwnProperty.call(data, key)) {
      instance[key] = data[key];
    }
  }
  return instance;
}
