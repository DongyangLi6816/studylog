const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api';

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
    this.name = 'ApiError';
  }
}

async function doRefresh(): Promise<string> {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    setAccessToken(null);
    throw new ApiError(401, await res.json().catch(() => ({})));
  }
  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

function getRefreshPromise(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401) {
    // Try to refresh once, then retry
    let newToken: string;
    try {
      newToken = await getRefreshPromise();
    } catch {
      throw new ApiError(401, {});
    }

    const retryHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${newToken}`,
    };
    const retry = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: retryHeaders,
    });
    if (!retry.ok) throw new ApiError(retry.status, await retry.json().catch(() => ({})));
    if (retry.status === 204) return undefined as T;
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => ({})));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
