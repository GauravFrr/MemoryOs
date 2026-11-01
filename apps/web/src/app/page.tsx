"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { getToken, userId, isLoaded } = useAuth();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const sendTokenToExtension = async () => {
      try {
        const token = await getToken();
        if (token) {
          // Post message to window so the extension content script can intercept it and save it
          window.postMessage({ type: "MEMORYOS_AUTH_TOKEN", token }, "*");
          setSynced(true);
        }
      } catch (err) {
        console.error("Failed to sync token with extension:", err);
      }
    };

    if (userId) {
      sendTokenToExtension();
      // Periodically sync the token in the background
      const interval = setInterval(sendTokenToExtension, 30 * 1000);
      return () => clearInterval(interval);
    } else {
      setSynced(false);
    }
  }, [userId, getToken]);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#121214",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#121214",
      color: "#f3f4f6",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#1a1a1e",
        border: "1px solid #2a2a30",
        borderRadius: "16px",
        padding: "40px",
        width: "100%",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
      }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 10px 0" }}>🧠 MemoryOS</h1>
        <p style={{ color: "#9ca3af", fontSize: "15px", margin: "0 0 30px 0" }}>Universal AI Memory Layer for Claude &amp; ChatGPT</p>

        {userId ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
              <UserButton appearance={{ elements: { userButtonAvatarBox: { width: "48px", height: "48px" } } }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>Successfully Logged In</div>
                <div style={{ fontSize: "13px", color: synced ? "#10b981" : "#9ca3af" }}>
                  {synced ? "✓ Synced with Extension" : "Syncing with Extension..."}
                </div>
              </div>
            </div>

            <div style={{
              background: synced ? "rgba(16, 185, 129, 0.08)" : "rgba(124, 92, 252, 0.08)",
              border: synced ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(124, 92, 252, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#d1d5db"
            }}>
              {synced ? (
                "Your authentication is fully synced! You can now close this window and use the MemoryOS button inside Claude or ChatGPT."
              ) : (
                "Authentication is active. Please ensure the MemoryOS extension is installed to complete the synchronization."
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
              Sign in to your account to synchronize your session with the browser extension.
            </p>
            <Link
              href="/sign-in"
              style={{
                background: "#7c5cfc",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "15px",
                textDecoration: "none",
                display: "inline-block",
                transition: "background 150ms",
              }}
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
