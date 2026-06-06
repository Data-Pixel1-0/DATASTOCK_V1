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
    const message = data?.error || data?.message || response.statusText || "Error de API";
    throw new Error(message);
  }

  return data;
}

export async function getProductos() {
  return request("/api/productos");
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

export async function loginUsuario(email, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ correo: email, password }),
  });
}

export async function signupUsuario(nombre, usuario, password, email) {
  return request("/api/signup", {
    method: "POST",
    body: JSON.stringify({ nombre, usuario, password, email }),
  });
}
