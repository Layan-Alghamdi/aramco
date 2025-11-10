import { useEffect, useState } from "react";
import { getActiveUser, subscribeToActiveUser } from "@/lib/usersStore";

export default function useCurrentUser() {
  const [user, setUser] = useState(() => getActiveUser());

  useEffect(() => {
    const unsubscribe = subscribeToActiveUser(setUser);
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return user;
}


