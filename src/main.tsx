import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AuthProvider } from "./lib/backend/auth";
import { isSupabaseConfigured } from "./lib/backend/client";
import { pullAll } from "./lib/backend/sync";
import "./styles/index.css";

async function start() {
  // Pages read their data synchronously on mount, so load what this user
  // can see from Supabase before the first render.
  if (isSupabaseConfigured) {
    // Never keep the user staring at a blank page if the server is unreachable.
    const timeout = new Promise((resolve) => setTimeout(resolve, 4000));
    try {
      await Promise.race([pullAll(), timeout]);
    } catch (e) {
      console.error("Initial data load failed", e);
    }
  }
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

start();
