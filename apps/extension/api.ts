import { Storage } from "@plasmohq/storage";

const storage = new Storage({ area: "local" });

const API_URL =
  process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001";

export async function refreshSilentToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "REFRESH_TOKEN" }, (response) => {
      if (response && response.token) {
        resolve(response.token);
      } else {
        console.warn("[MemoryOS] Silent token refresh failed:", response?.error || "Unknown error");
        resolve(null);
      }
    });
  });
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = await storage.get("clerk-token");

  const makeRequest = async (activeToken: string | undefined) => {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (activeToken) {
      headers.set("Authorization", `Bearer ${activeToken}`);
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  // If unauthorized (401), silently refresh the session token and retry the API call
  if (response.status === 401) {
    console.log("[MemoryOS] Token expired or unauthorized. Attempting silent refresh...");
    const newToken = await refreshSilentToken();
    if (newToken) {
      console.log("[MemoryOS] Silent refresh succeeded. Retrying request...");
      response = await makeRequest(newToken);
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  return response.json();
}
