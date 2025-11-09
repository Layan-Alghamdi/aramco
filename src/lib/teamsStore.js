const STORAGE_KEY = "app.teams";
const EVENT_KEY = "teams:updated";

const isBrowser = () => typeof window !== "undefined";

const parseTeams = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse teams from storage", error);
    return [];
  }
};

export function getTeams() {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return parseTeams(raw);
}

export function saveTeams(teams) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  const event = new CustomEvent(EVENT_KEY, { detail: { teams } });
  window.dispatchEvent(event);
}

const generateId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `team-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function createTeam(input) {
  const teams = getTeams();
  const now = new Date().toISOString();
  const team = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description?.trim() || "",
    avatarUrl: input.avatarUrl || "",
    members: input.members ?? [],
    createdAt: now,
    updatedAt: now
  };
  teams.push(team);
  saveTeams(teams);
  return team;
}

export function updateTeam(id, patch) {
  const teams = getTeams();
  const index = teams.findIndex((team) => team.id === id);
  if (index === -1) {
    throw new Error(`Team with id ${id} not found`);
  }
  const now = new Date().toISOString();
  const current = teams[index];
  const updated = {
    ...current,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    description:
      patch.description !== undefined ? patch.description.trim() : current.description,
    avatarUrl:
      patch.avatarUrl !== undefined ? patch.avatarUrl : current.avatarUrl,
    members: patch.members !== undefined ? patch.members : current.members,
    updatedAt: now
  };
  teams[index] = updated;
  saveTeams(teams);
  return updated;
}

export function deleteTeam(id) {
  const teams = getTeams();
  const next = teams.filter((team) => team.id !== id);
  saveTeams(next);
}

export function findTeam(id) {
  const teams = getTeams();
  return teams.find((team) => team.id === id);
}

export function subscribeToTeams(callback) {
  if (!isBrowser()) return () => {};
  const handler = (event) => {
    if (typeof callback === "function") {
      callback(event.detail?.teams ?? getTeams());
    }
  };
  const storageHandler = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getTeams());
    }
  };
  window.addEventListener(EVENT_KEY, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT_KEY, handler);
    window.removeEventListener("storage", storageHandler);
  };
}


