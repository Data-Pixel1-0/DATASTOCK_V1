import { useCallback, useEffect, useState } from "react";
import { getUsuario } from "../services/api.js";
import { getCurrentUser, saveCurrentUser } from "../utils/auth.js";

export function useSessionUser() {
  const [user, setUser] = useState(() => getCurrentUser());

  const refreshUser = useCallback(async () => {
    const current = getCurrentUser();
    if (!current?.id) {
      setUser(current);
      return;
    }

    try {
      const updatedUser = await getUsuario(current.id);
      saveCurrentUser(updatedUser);
      setUser(updatedUser);
    } catch {
      setUser(current);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      refreshUser();
    }, 0);
    const intervalId = window.setInterval(refreshUser, 8000);

    const handleFocus = () => refreshUser();
    const handleUserUpdated = (event) => {
      if (event.detail) {
        setUser(event.detail);
      } else {
        refreshUser();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("datastock-user-updated", handleUserUpdated);

    return () => {
      window.clearTimeout(timerId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("datastock-user-updated", handleUserUpdated);
    };
  }, [refreshUser]);

  return user;
}
