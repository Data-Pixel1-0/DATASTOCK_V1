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

export async function getUsuarios() {
  return request("/api/usuarios");
}

export async function loginUsuario(usuario, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ usuario, password }),
  });
}
