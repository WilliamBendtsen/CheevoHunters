const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

export async function getGames(params = {}) {
  return apiRequest(`/games${toQueryString(params)}`);
}

export async function getGame(gameId) {
  return apiRequest(`/games/${gameId}`);
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

async function apiRequest(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error?.message ?? "API request failed.");
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
