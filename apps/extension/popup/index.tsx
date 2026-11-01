import React, { useEffect } from "react";

export default function IndexPopup() {
  useEffect(() => {
    // Instantly open the Web Dashboard in a new tab and close the popup window.
    // The Web Dashboard handles login (Google OAuth works natively since it's a standard web page)
    // and automatically syncs the session token to the extension via our auth-sync content script.
    chrome.tabs.create({ url: "http://localhost:3000" });
    window.close();
  }, []);

  return (
    <div style={{ width: "200px", height: "100px", background: "#171717", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#ececf1", fontSize: "12px", fontFamily: "sans-serif" }}>Opening Dashboard...</p>
    </div>
  );
}
