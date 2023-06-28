export function formatString(query: string, params: any[]) {
  for (let i = 0; i < params.length; i++) {
    query = query.replace(`{${i}}`, params[i]);
  }
  return query;
}
