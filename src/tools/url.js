export function buildUrl (baseUrl, params) {
  const url = new URL(baseUrl)
  for (let key in params) url.searchParams.set(key, params[key])
  return url.toString()
}
