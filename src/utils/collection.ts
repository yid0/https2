export function mapToArray(collection: Set<any>, attr?: any) {
  const result: any[] = [];
  collection.forEach(obj => {
    attr ? result.push(obj[attr]) : result.push(obj);
  });
  return result;
}

function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
  return propertyNames.map(n => o[n]);
}
