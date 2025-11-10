const USERS_STORAGE_KEY = "app.users";
const ACTIVE_USER_KEY = "app.activeUserId";
const USERS_EVENT = "users:updated";
const ACTIVE_USER_EVENT = "users:active";

const isBrowser = () => typeof window !== "undefined";

const DEFAULT_USERS = [
  {
    id: "user-layan",
    name: "Layan Alghamdi",
    role: "Lead Designer",
    email: "layan.alghamdi@aramco.com",
    department: "Digital Studio",
    employeeId: "DG-1024",
    avatarUrl: "",
    phone: "+966 12 345 6789",
    location: "Dhahran, Saudi Arabia",
    joinedAt: "2024-02-14T09:00:00.000Z",
    lastLoginAt: "2025-10-31T07:45:00.000Z",
    templates: [
      {
        id: "tmpl-ai-overview",
        name: "AI Portfolio Overview",
        category: "Corporate deck",
        updatedAt: "2025-10-25T12:35:00.000Z"
      },
      {
        id: "tmpl-quarterly-review",
        name: "Quarterly Business Review",
        category: "Executive summary",
        updatedAt: "2025-09-18T08:15:00.000Z"
      },
      {
        id: "tmpl-product-sprint",
        name: "Product Sprint Roadmap",
        category: "Planning",
        updatedAt: "2025-08-02T14:05:00.000Z"
      }
    ],
    createdTeamIds: [],
    favoriteProjectIds: []
  }
];

const generateId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseUsers = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((user) => ({
        templates: [],
        createdTeamIds: [],
        favoriteProjectIds: [],
        ...user
      }));
    }
    return null;
  } catch (error) {
    console.warn("Unable to parse users from storage", error);
    return null;
  }
};

const persistUsers = (users) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(USERS_EVENT, { detail: { users } }));
};

const ensureUsersSeeded = () => {
  if (!isBrowser()) {
    return DEFAULT_USERS;
  }
  const existing = parseUsers(window.localStorage.getItem(USERS_STORAGE_KEY));
  if (existing && existing.length > 0) {
    return existing;
  }
  persistUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
};

export function getUsers() {
  return ensureUsersSeeded();
}

export function getUserById(userId) {
  if (!userId) return null;
  return getUsers().find((user) => user.id === userId) ?? null;
}

export function getActiveUserId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_USER_KEY);
}

export function getActiveUser() {
  const users = getUsers();
  if (users.length === 0) return null;
  const activeId = getActiveUserId();
  if (!activeId) {
    return users[0];
  }
  return users.find((user) => user.id === activeId) ?? users[0];
}

const dispatchActiveUser = (user) => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(ACTIVE_USER_EVENT, { detail: { user } }));
};

export function setActiveUser(userId) {
  if (!isBrowser()) return;
  const users = getUsers();
  const next = users.find((user) => user.id === userId) ?? users[0] ?? null;
  if (next) {
    window.localStorage.setItem(ACTIVE_USER_KEY, next.id);
    dispatchActiveUser(next);
  }
}

export function clearActiveUser() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACTIVE_USER_KEY);
  dispatchActiveUser(null);
}

export function upsertUser(userInput) {
  const users = getUsers();
  const index = users.findIndex((item) => item.id === userInput.id);
  if (index === -1) {
    const user = {
      id: userInput.id ?? generateId(),
      name: userInput.name ?? "New User",
      role: userInput.role ?? "Viewer",
      email: userInput.email ?? "",
      department: userInput.department ?? "",
        employeeId: userInput.employeeId ?? "",
      avatarUrl: userInput.avatarUrl ?? "",
      phone: userInput.phone ?? "",
      location: userInput.location ?? "",
      joinedAt: userInput.joinedAt ?? new Date().toISOString(),
      lastLoginAt: userInput.lastLoginAt ?? new Date().toISOString(),
      templates: userInput.templates ?? [],
      createdTeamIds: userInput.createdTeamIds ?? [],
      favoriteProjectIds: userInput.favoriteProjectIds ?? []
    };
    persistUsers([...users, user]);
    return user;
  }
  const current = users[index];
  const updated = {
    ...current,
    ...userInput,
    templates: userInput.templates ?? current.templates ?? [],
    createdTeamIds: userInput.createdTeamIds ?? current.createdTeamIds ?? [],
      favoriteProjectIds: userInput.favoriteProjectIds ?? current.favoriteProjectIds ?? [],
      employeeId: userInput.employeeId ?? current.employeeId ?? ""
  };
  const nextUsers = [...users];
  nextUsers[index] = updated;
  persistUsers(nextUsers);
  if (getActiveUserId() === updated.id) {
    dispatchActiveUser(updated);
  }
  return updated;
}

export function updateActiveUser(patch) {
  const current = getActiveUser();
  if (!current) return null;
  return upsertUser({
    ...current,
    ...patch
  });
}

export function ensureActiveUserByEmail(email) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return getActiveUser();
  const users = getUsers();
  let user =
    users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail) ?? null;
  if (!user) {
    const guessedName = normalizedEmail.split("@")[0]?.replace(/[._]/g, " ") ?? "New User";
    const capitalizedName = guessedName
      .split(" ")
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
      .join(" ")
      .trim();
    user = upsertUser({
      id: generateId(),
      name: capitalizedName || "New Collaborator",
      role: "Viewer",
      email: normalizedEmail,
      department: "Digital Experience",
      avatarUrl: "",
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      templates: [],
      createdTeamIds: [],
      favoriteProjectIds: []
    });
  } else {
    user = upsertUser({
      ...user,
      lastLoginAt: new Date().toISOString()
    });
  }
  setActiveUser(user.id);
  return user;
}

export function getTemplatesForUser(userId) {
  return getUserById(userId)?.templates ?? [];
}

export function setTemplatesForUser(userId, templates) {
  const user = getUserById(userId);
  if (!user) return null;
  return upsertUser({
    ...user,
    templates: Array.isArray(templates) ? templates : user.templates ?? []
  });
}

export function appendTemplateForUser(userId, template) {
  const user = getUserById(userId);
  if (!user) return null;
  const nextTemplates = [...(user.templates ?? []), template];
  return upsertUser({
    ...user,
    templates: nextTemplates
  });
}

export function recordTeamForUser(userId, teamId) {
  if (!userId || !teamId) return;
  const user = getUserById(userId);
  if (!user) return;
  const existing = new Set(user.createdTeamIds ?? []);
  if (!existing.has(teamId)) {
    existing.add(teamId);
    upsertUser({
      ...user,
      createdTeamIds: Array.from(existing)
    });
  }
}

export function recordProjectForUser(userId, projectId) {
  if (!userId || !projectId) return;
  const user = getUserById(userId);
  if (!user) return;
  const existing = new Set(user.favoriteProjectIds ?? []);
  if (!existing.has(projectId)) {
    existing.add(projectId);
    upsertUser({
      ...user,
      favoriteProjectIds: Array.from(existing)
    });
  }
}

export function subscribeToActiveUser(callback) {
  if (!isBrowser()) {
    return () => {};
  }
  const handler = (event) => {
    if (typeof callback === "function") {
      callback(event.detail?.user ?? getActiveUser());
    }
  };
  const storageHandler = (event) => {
    if (event.key === ACTIVE_USER_KEY || event.key === USERS_STORAGE_KEY) {
      callback(getActiveUser());
    }
  };
  window.addEventListener(ACTIVE_USER_EVENT, handler);
  window.addEventListener(USERS_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(ACTIVE_USER_EVENT, handler);
    window.removeEventListener(USERS_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function signOutUser() {
  clearActiveUser();
  if (isBrowser()) {
    window.localStorage.removeItem("isAuth");
  }
}


