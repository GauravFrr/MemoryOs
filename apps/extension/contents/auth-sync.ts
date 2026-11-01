import type { PlasmoCSConfig } from "plasmo";
import { Storage } from "@plasmohq/storage";

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:3000/*"],
  all_frames: false,
  run_at: "document_idle",
};

const storage = new Storage({ area: "local" });

// Listen for the custom message sent by the Next.js app to transfer the authentication session
window.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "MEMORYOS_AUTH_TOKEN") {
    const token = event.data.token;
    if (token) {
      await storage.set("clerk-token", token);
      console.log("[MemoryOS] Session token synchronized successfully from Web Dashboard.");
    } else {
      await storage.remove("clerk-token");
      console.log("[MemoryOS] Session token removed.");
    }
  }
});
