const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

async function handle<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && data.error ? data.error.message : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`).then((r) => handle<T>(r));
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((r) => handle<T>(r));
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<T>(r));
  },
  del<T>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`, { method: "DELETE" }).then((r) => handle<T>(r));
  },
};
