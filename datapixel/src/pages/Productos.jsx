import { useEffect, useState } from "react";
import { getProductos } from "../services/api";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProductos() {
      try {
        const data = await getProductos();
        setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    }

    loadProductos();
  }, []);

  const columns = productos.length ? Object.keys(productos[0]) : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && productos.length === 0 && <p>No se encontraron productos.</p>}
      {!loading && productos.length > 0 && (
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
              {productos.map((producto, index) => (
                <tr key={index} className="even:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${index}-${column}`} className="border px-3 py-2">
                      {producto[column] ?? "-"}
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

export default Productos;