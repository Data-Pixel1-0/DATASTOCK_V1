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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && usuarios.length === 0 && <p>No se encontraron usuarios.</p>}
      {!loading && usuarios.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100">
                {columns.map((column) => (
                  <th key={column} className="border px-3 py-2 text-left">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr key={index} className="even:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${index}-${column}`} className="border px-3 py-2">
                      {usuario[column] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Usuarios;