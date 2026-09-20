// Centralized Authenticated Fetch Helper for Frontend Client

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("essgi_auth_token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem("essgi_auth_token", token);
  } catch {
    // Silent fail
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem("essgi_auth_token");
  } catch {
    // Silent fail
  }
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Also include content-type JSON if body is present and not already set
  if (init?.body && !headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers
  });
}
