const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

export async function getGames(params = {}) {
  return apiRequest(`/games${toQueryString(params)}`);
}

export async function getGame(gameId) {
  return apiRequest(`/games/${gameId}`);
}

export async function indexIgdbGame(game) {
  return apiRequest("/games/index", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(game),
  });
}

export async function getSession(sessionId) {
  return apiRequest(`/sessions/${sessionId}`);
}

export async function createSession(payload) {
  return apiRequest("/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getDashboard() {
  return apiRequest("/users/me/dashboard");
}

export async function searchIgdbGames(query) {
  return apiRequest(`/igdb/search${toQueryString({ q: query })}`);
}

async function apiRequest(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, credentials: "include" });
  const body = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) window.dispatchEvent(new Event("auth-expired"));
    const error = new Error(body.error?.message ?? "API request failed.");
    error.status = response.status;
    throw error;
  }

  return body.data;
}

function toQueryString(params) {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ""),
  );
  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export const getCurrentUser = () => apiRequest("/users/me");
const authRequest = (action, payload = {}) => apiRequest(`/auth/${action}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
});
export const signUp = (payload) => authRequest("signup", payload);
export const signIn = (payload) => authRequest("login", payload);
export const signOut = () => authRequest("logout");

export const uploadAvatar = (file) => apiRequest("/users/me/avatar", {
  method: "PUT", headers: { "Content-Type": file.type }, body: file,
});

export const sendSessionMessage = (sessionId, message) => apiRequest(`/sessions/${sessionId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});
