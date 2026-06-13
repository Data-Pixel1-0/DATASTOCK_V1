import { useEffect, useState } from "react";
import { getUsuarios, updateUsuarioRol } from "../services/api";
import { useSessionUser } from "../hooks/useSessionUser.js";
import { canAccess, saveCurrentUser } from "../utils/auth.js";

const roles = ["administrador", "empleado", "consulta"];

function Usuarios() {
  const user = useSessionUser();
  const canManageUsers = canAccess("manage-users", user);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  async function loadUsuarios() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadUsuarios();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const handleRoleChange = async (usuarioId, rol) => {
    setMessage(null);
    try {
      await updateUsuarioRol(usuarioId, rol);
      if (String(user?.id) === String(usuarioId)) {
        saveCurrentUser({ ...user, rol });
      }
      setMessage({ type: "success", text: "Rol actualizado correctamente." });
      await loadUsuarios();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "No se pudo actualizar el rol." });
    }
  };

  return (
    <div className="space-y-7">
      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Equipo</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="theme-heading text-3xl font-bold text-[#082758]">Usuarios</h1>
            <p className="theme-muted mt-2 text-slate-500">Consulta cuentas y administra roles de acceso.</p>
          </div>
          <div className="rounded-2xl bg-[#eef6ff] px-4 py-3 text-sm font-bold text-[#082758]">
            {loading ? "Cargando..." : `${usuarios.length} usuarios`}
          </div>
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-semibold ${message.type === "success" ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message.text}
        </div>
      )}

      <section className="theme-card overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
        {loading && <p className="p-6 text-[#082758]">Cargando usuarios...</p>}
        {error && <p className="p-6 text-rose-700">{error}</p>}
        {!loading && !error && usuarios.length === 0 && <p className="p-6 text-slate-500">No se encontraron usuarios.</p>}
        {!loading && usuarios.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#eef6ff] text-[#082758]">
                <tr>
                  {["Nombre", "Usuario", "Email", "Rol", "Permisos"].map((column) => (
                    <th key={column} className="border-b border-[#d8e8f7] px-4 py-3 text-sm font-bold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-[#d8e8f7] even:bg-[#f8fbff]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#082758]">{usuario.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">@{usuario.usuario}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{usuario.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {canManageUsers ? (
                        <select
                          value={usuario.rol || "empleado"}
                          onChange={(event) => handleRoleChange(usuario.id, event.target.value)}
                          className="theme-input rounded-2xl border border-[#d8e8f7] bg-white px-3 py-2 text-sm font-bold text-[#082758]"
                        >
                          {roles.map((rol) => (
                            <option key={rol} value={rol}>{rol}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-[#eef6ff] px-3 py-1 font-bold text-[#082758]">{usuario.rol}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {usuario.rol === "administrador"
                        ? "Control total"
                        : usuario.rol === "consulta"
                        ? "Solo visualizacion"
                        : "Entradas y salidas"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Usuarios;
