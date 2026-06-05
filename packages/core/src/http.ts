export async function http<T, P = null>(url: string, params?: P): Promise<T> {
  const search = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  const response = await fetch(url + search);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
