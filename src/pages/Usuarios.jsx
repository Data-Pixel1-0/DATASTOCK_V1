import { useEffect, useState } from "react";
import { getUsuarios } from "../services/api";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsuarios() {
      try {
        const data = await getUsuarios();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    }

    loadUsuarios();
  }, []);

  const columns = usuarios.length ? Object.keys(usuarios[0]) : [];

  return (
    <div className="space-y-7">
      <section className="rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Equipo</p>
        <h1 className="mt-2 text-3xl font-bold text-[#082758]">Usuarios</h1>
        <p className="mt-2 text-slate-500">Consulta las cuentas registradas en el sistema.</p>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
        {loading && <p className="p-6 text-[#082758]">Cargando usuarios...</p>}
        {error && <p className="p-6 text-rose-700">{error}</p>}
        {!loading && !error && usuarios.length === 0 && (
          <p className="p-6 text-slate-500">No se encontraron usuarios.</p>
        )}
        {!loading && usuarios.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#eef6ff] text-[#082758]">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="border-b border-[#d8e8f7] px-4 py-3 text-sm font-bold capitalize">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={index} className="border-b border-[#d8e8f7] even:bg-[#f8fbff]">
                    {columns.map((column) => (
                      <td key={`${index}-${column}`} className="px-4 py-3 text-sm text-slate-600">
                        {usuario[column] ?? "-"}
                      </td>
                    ))}
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
