const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const fallbackMessage =
      response.status === 404
        ? `Ruta de API no encontrada: ${path}. Reinicia el backend para cargar los nuevos endpoints.`
        : response.statusText || "Error de API";
    const message = data?.error || data?.message || fallbackMessage;
    throw new Error(message);
  }

  return data;
}

export async function getProductos() {
  return request("/api/productos");
}

export async function getDashboard() {
  return request("/api/dashboard");
}

export async function getProductoDetalle(productoId) {
  return request(`/api/productos/${productoId}`);
}

export async function createProducto(producto) {
  return request("/api/productos", {
    method: "POST",
    body: JSON.stringify(producto),
  });
}

export async function updateProducto(productoId, producto) {
  return request(`/api/productos/${productoId}`, {
    method: "PUT",
    body: JSON.stringify(producto),
  });
}

export async function deleteProducto(productoId) {
  return request(`/api/productos/${productoId}`, {
    method: "DELETE",
  });
}

export async function getUsuarios() {
  return request("/api/usuarios");
}

export async function getUsuario(usuarioId) {
  return request(`/api/usuarios/${usuarioId}`);
}

export async function updateUsuarioRol(usuarioId, rol) {
  return request(`/api/usuarios/${usuarioId}/rol`, {
    method: "PUT",
    body: JSON.stringify({ rol }),
  });
}

export async function getMovimientos() {
  return request("/api/movimientos");
}

export async function createMovimiento(movimiento) {
  return request("/api/movimientos", {
    method: "POST",
    body: JSON.stringify(movimiento),
  });
}

export async function changePassword(payload) {
  return request("/api/usuarios/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function loginUsuario(email, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ correo: email, password }),
  });
}
