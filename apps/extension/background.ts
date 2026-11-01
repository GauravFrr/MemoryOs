import { Storage } from "@plasmohq/storage";

const storage = new Storage({ area: "local" });

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp * 1000;
    
    return Date.now() > (exp - 5000);
  } catch (err) {
    return true;
  }
}

// Service worker utilizing chrome.cookies API to pull Clerk's session token directly from localhost
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REFRESH_TOKEN") {
    // DIAGNOSTIC: Get all cookies in the browser to inspect what domains exist
    chrome.cookies.getAll({}, async (allCookies) => {
      const debugList = allCookies.map(c => `${c.domain} : ${c.name}`).slice(0, 30);
      await storage.set("debug-cookies", debugList);
      
      // 1. Try reading the active Clerk cookie __session from localhost:3000
      chrome.cookies.get({ url: "http://localhost:3000", name: "__session" }, (cookie) => {
        let token = cookie?.value;
        
        // 2. Fallback: Try 127.0.0.1:3000
        if (!token) {
          chrome.cookies.get({ url: "http://127.0.0.1:3000", name: "__session" }, (cookie2) => {
            token = cookie2?.value;
            handleTokenResponse(token, sendResponse);
          });
        } else {
          handleTokenResponse(token, sendResponse);
        }
      });
    });
    return true; // Keep channel open for async response
  }
});

async function handleTokenResponse(token: string | undefined, sendResponse: (r: any) => void) {
  if (token && !isJwtExpired(token)) {
    console.log("[MemoryOS SW] Retrieved active session token from cookie!");
    await storage.set("clerk-token", token);
    sendResponse({ token });
  } else {
    console.warn("[MemoryOS SW] Clerk session cookie is missing or expired.");
    sendResponse({ error: `No active session cookie found. Cookie found: ${!!token}` });
  }
}
