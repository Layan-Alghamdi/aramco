import { useEffect, useState } from "react";
import { getTeams, subscribeToTeams } from "@/lib/teamsStore";

export default function useTeams() {
  const [teams, setTeams] = useState(() => getTeams());

  useEffect(() => {
    const unsubscribe = subscribeToTeams(setTeams);
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return teams;
}


