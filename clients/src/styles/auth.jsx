import { createAuthProvider } from "react-token-auth";

// API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const { useAuth, authFetch, login } = createAuthProvider({
  accessTokenKey: "access_token",
  onUpdateToken: (token) =>
    fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ token }),
    }).then((r) => r.json()),
});
