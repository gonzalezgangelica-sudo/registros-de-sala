/** Login local (usuario + contraseña) — protección básica de planta */

const USERS_KEY = "rmp_users";
const SESSION_KEY = "rmp_session";

/** Usuarios por defecto (cámbialos en Config → Usuarios) */
export const DEFAULT_USERS = [
  { user: "admin", pass: "admin123", nombre: "Administrador", admin: true },
  { user: "sala", pass: "sala123", nombre: "Operario sala", admin: false },
];

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      saveUsers(DEFAULT_USERS);
      return structuredClone(DEFAULT_USERS);
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length ? list : structuredClone(DEFAULT_USERS);
  } catch {
    return structuredClone(DEFAULT_USERS);
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (!s || !s.user) return null;
    // sesión válida mientras el navegador/app esté abierta
    return s;
  } catch {
    return null;
  }
}

export function setSession(userObj) {
  const session = {
    user: userObj.user,
    nombre: userObj.nombre || userObj.user,
    admin: !!userObj.admin,
    loginAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("rmp_usuario", session.nombre || session.user);
  return session;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function login(username, password) {
  const u = String(username || "").trim().toLowerCase();
  const p = String(password || "");
  if (!u || !p) return { ok: false, error: "Introduce usuario y contraseña." };
  const found = loadUsers().find(
    (x) => String(x.user).toLowerCase() === u && String(x.pass) === p
  );
  if (!found) return { ok: false, error: "Usuario o contraseña incorrectos." };
  const session = setSession(found);
  return { ok: true, session };
}

export function requireAuth() {
  return !!getSession();
}
