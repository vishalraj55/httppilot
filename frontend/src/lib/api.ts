const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res.json();
}