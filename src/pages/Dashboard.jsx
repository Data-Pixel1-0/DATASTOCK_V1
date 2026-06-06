import { useEffect, useState } from "react";
import { getProductos } from "../services/api";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProductos();
  }, []);

  async function loadProductos() {
    setLoading(true);
    setError("");
    try {
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  const lowStockThreshold = 5;
  const totalProductos = productos.length;
  const numericProducts = productos.map((producto) => ({
    ...producto,
    precio: Number(String(producto.precio).replace(",", ".")) || 0,
    stock: Number(String(producto.stock).replace(",", ".")) || 0,
  }));

  const stockBajoCount = numericProducts.filter((producto) => producto.stock <= lowStockThreshold).length;
  const criticalStockCount = numericProducts.filter((producto) => producto.stock > 0 && producto.stock <= lowStockThreshold).length;
  const outOfStockCount = numericProducts.filter((producto) => producto.stock <= 0).length;

  const valorInventario = numericProducts.reduce(
    (sum, producto) => sum + producto.precio * producto.stock,
    0
  );

  const lowStockProducts = [...numericProducts]
    .filter((producto) => producto.stock > 0 && producto.stock <= lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const latestProducts = [...numericProducts]
    .filter(Boolean)
    .sort((a, b) => {
      const aId = Number(a.id);
      const bId = Number(b.id);
      if (!Number.isNaN(aId) && !Number.isNaN(bId)) return bId - aId;
      return 0;
    })
    .slice(0, 5);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inicio</h1>
        <p className="text-gray-600 mt-2">Bienvenido al panel de control. Aquí tienes un resumen rápido del inventario.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          <p className="text-sm uppercase tracking-wide text-gray-500">Total de productos</p>
          <p className="mt-4 text-4xl font-semibold text-blue-950">{loading ? "..." : totalProductos}</p>
          <p className="mt-2 text-gray-500">Productos registrados en el sistema.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          <p className="text-sm uppercase tracking-wide text-gray-500">Stock bajo</p>
          <p className="mt-4 text-4xl font-semibold text-blue-950">{loading ? "..." : stockBajoCount}</p>
          <p className="mt-2 text-gray-500">Productos con stock igual o menor a {lowStockThreshold}.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          <p className="text-sm uppercase tracking-wide text-gray-500">Valor invent.</p>
          <p className="mt-4 text-4xl font-semibold text-blue-950">{loading ? "..." : formatCurrency(valorInventario)}</p>
          <p className="mt-2 text-gray-500">Valor total de los productos activos.</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Productos de menos stock</h2>
            <p className="text-gray-600 mt-1">Revisa los productos que están en riesgo de agotarse.</p>
          </div>
        </div>

        {loading ? (
          <p>Cargando estadísticas...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : lowStockProducts.length === 0 ? (
          <p className="text-gray-600">No hay productos con stock bajo en este momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lowStockProducts.map((producto) => (
              <div key={producto.id ?? producto.nombre} className="rounded-3xl bg-white p-5 shadow-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500">{producto.nombre || "Producto"}</p>
                <p className="mt-3 text-3xl font-semibold text-blue-950">{producto.stock}</p>
                <p className="mt-2 text-gray-500">Stock disponible</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Precio: {formatCurrency(producto.precio)}</p>
                  <p className="mt-1">ID: {producto.id ?? producto.identificacion ?? "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Últimos productos agregados</h2>
            <p className="text-gray-600 mt-1">Se actualiza con los productos más recientes.</p>
          </div>
        </div>

        {loading ? (
          <p>Cargando productos recientes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : latestProducts.length === 0 ? (
          <p className="text-gray-600">No hay productos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white shadow-lg border border-gray-200">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border px-4 py-3">ID</th>
                  <th className="border px-4 py-3">Nombre</th>
                  <th className="border px-4 py-3">Stock</th>
                  <th className="border px-4 py-3">Precio</th>
                  <th className="border px-4 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {latestProducts.map((producto) => (
                  <tr key={producto.id ?? producto.nombre} className="even:bg-slate-50">
                    <td className="border px-4 py-3">{producto.id ?? producto.identificacion ?? "-"}</td>
                    <td className="border px-4 py-3">{producto.nombre}</td>
                    <td className="border px-4 py-3">{producto.stock}</td>
                    <td className="border px-4 py-3">{formatCurrency(producto.precio)}</td>
                    <td className="border px-4 py-3">{producto.descripcion ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10 rounded-3xl bg-slate-950 p-6 text-white shadow-lg border border-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500 text-xl">⚠️</span>
          <h2 className="text-2xl font-semibold">Alertas</h2>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Hay <span className="font-semibold text-white">{loading ? "..." : criticalStockCount}</span> productos con stock crítico.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Existen <span className="font-semibold text-white">{loading ? "..." : outOfStockCount}</span> productos agotados.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
            <p className="text-sm text-slate-400">Última copia de seguridad: hace 2 días.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
