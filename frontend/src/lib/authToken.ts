let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

export function getAuthToken() {
  if (currentToken) return currentToken;
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("financy-auth");
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { state?: { token?: string | null } };
    currentToken = parsed.state?.token ?? null;
    return currentToken;
  } catch {
    return null;
  }
}
