export const rolePermissions = {
  administrador: ["dashboard", "productos", "movimientos", "usuarios", "reportes", "configuracion", "manage-products", "manage-users"],
  admin: ["dashboard", "productos", "movimientos", "usuarios", "reportes", "configuracion", "manage-products", "manage-users"],
  empleado: ["dashboard", "productos", "movimientos", "reportes", "configuracion", "create-movements"],
  consulta: ["dashboard", "productos", "movimientos", "reportes", "configuracion"],
  usuario: ["dashboard", "productos", "movimientos", "usuarios", "reportes", "configuracion", "manage-products", "manage-users", "create-movements"],
};

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("datastock-user")) || null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  if (!user) return;
  localStorage.setItem("datastock-user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("datastock-user-updated", { detail: user }));
}

export function getUserRole(user = getCurrentUser()) {
  return String(user?.rol || "administrador").toLowerCase();
}

export function canAccess(permission, user = getCurrentUser()) {
  const permissions = rolePermissions[getUserRole(user)] || rolePermissions.consulta;
  return permissions.includes(permission);
}
