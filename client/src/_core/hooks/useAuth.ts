import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/oauth/me", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          return;
        }

        setUser(await res.json());
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    window.location.href = "/api/oauth/logout";
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}