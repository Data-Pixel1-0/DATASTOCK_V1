import { useCallback, useEffect, useState } from "react";
import { getProductos } from "../services/api";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProductos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadProductos();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadProductos]);

  const lowStockThreshold = 5;
  const numericProducts = productos.map((producto) => ({
    ...producto,
    precio: Number(String(producto.precio).replace(",", ".")) || 0,
    stock: Number(String(producto.stock).replace(",", ".")) || 0,
  }));

  const totalProductos = productos.length;
  const stockBajoCount = numericProducts.filter((producto) => producto.stock <= lowStockThreshold).length;
  const criticalStockCount = numericProducts.filter((producto) => producto.stock > 0 && producto.stock <= lowStockThreshold).length;
  const outOfStockCount = numericProducts.filter((producto) => producto.stock <= 0).length;
  const healthyStockCount = numericProducts.filter((producto) => producto.stock > lowStockThreshold).length;

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

  const metricCards = [
    {
      label: "Total de productos",
      value: totalProductos,
      helper: "Productos registrados",
      color: "from-[#2f7fd3] to-[#082758]",
    },
    {
      label: "Stock bajo",
      value: stockBajoCount,
      helper: `Igual o menor a ${lowStockThreshold}`,
      color: "from-[#69b523] to-[#2f7d1f]",
    },
    {
      label: "Valor inventario",
      value: formatCurrency(valorInventario),
      helper: "Valor total activo",
      color: "from-[#082758] to-[#184f9c]",
    },
  ];

  const alertCards = [
    {
      label: "Stock critico",
      value: criticalStockCount,
      helper: "Productos que necesitan reposicion pronto.",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      label: "Agotados",
      value: outOfStockCount,
      helper: "Productos sin unidades disponibles.",
      tone: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      label: "Stock saludable",
      value: healthyStockCount,
      helper: "Productos por encima del umbral minimo.",
      tone: "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
        <div className="bg-[linear-gradient(135deg,_#082758_0%,_#2f7fd3_58%,_#69b523_100%)] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100">Inicio</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Resumen del inventario</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-50">
                Revisa existencias, valor total y productos que requieren atencion desde una vista mas clara y dinamica.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/15 px-5 py-4 backdrop-blur">
              <p className="text-sm text-blue-50">Estado general</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "Cargando..." : `${healthyStockCount} productos estables`}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-3">
          {metricCards.map((card) => (
            <article key={card.label} className="group overflow-hidden rounded-[28px] border border-[#d8e8f7] bg-white shadow-lg shadow-[#082758]/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <div className="p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className="mt-4 text-4xl font-bold text-[#082758]">{loading ? "..." : card.value}</p>
                <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {alertCards.map((alert) => (
          <article key={alert.label} className={`rounded-[28px] border p-5 shadow-lg shadow-[#082758]/5 ${alert.tone}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] opacity-80">{alert.label}</p>
                <p className="mt-3 text-4xl font-bold">{loading ? "..." : alert.value}</p>
              </div>
              <span className="mt-1 h-3 w-3 rounded-full bg-current opacity-60" />
            </div>
            <p className="mt-3 text-sm leading-6 opacity-80">{alert.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Prioridad</p>
            <h2 className="mt-2 text-2xl font-bold text-[#082758]">Productos de menos stock</h2>
            <p className="mt-1 text-sm text-slate-500">Revisa los productos que estan en riesgo de agotarse.</p>
          </div>

          {loading ? (
            <p className="rounded-2xl bg-[#eef6ff] p-4 text-[#082758]">Cargando estadisticas...</p>
          ) : error ? (
            <p className="rounded-2xl bg-rose-50 p-4 text-rose-700">{error}</p>
          ) : lowStockProducts.length === 0 ? (
            <p className="rounded-2xl bg-[#f1f9eb] p-4 text-[#2f7d1f]">No hay productos con stock bajo en este momento.</p>
          ) : (
            <div className="space-y-3">
                {lowStockProducts.map((producto, index) => (
                <div key={producto.id ?? producto.nombre} className="rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#082758]">{producto.nombre || "Producto"}</p>
                      <p className="mt-1 text-sm text-slate-500">ID: {index + 1}</p>
                    </div>
                    <div className="rounded-2xl bg-[#69b523] px-4 py-2 text-lg font-bold text-white">
                      {producto.stock}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Precio: {formatCurrency(producto.precio)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
          <div className="border-b border-[#d8e8f7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Actividad</p>
            <h2 className="mt-2 text-2xl font-bold text-[#082758]">Ultimos productos agregados</h2>
            <p className="mt-1 text-sm text-slate-500">Se actualiza con los productos mas recientes.</p>
          </div>

          {loading ? (
            <p className="p-6 text-[#082758]">Cargando productos recientes...</p>
          ) : error ? (
            <p className="p-6 text-rose-700">{error}</p>
          ) : latestProducts.length === 0 ? (
            <p className="p-6 text-slate-500">No hay productos registrados aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-[#eef6ff] text-[#082758]">
                  <tr>
                    <th className="px-4 py-3 text-sm font-bold">ID</th>
                    <th className="px-4 py-3 text-sm font-bold">Nombre</th>
                    <th className="px-4 py-3 text-sm font-bold">Stock</th>
                    <th className="px-4 py-3 text-sm font-bold">Precio</th>
                    <th className="px-4 py-3 text-sm font-bold">Descripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {latestProducts.map((producto, index) => (
                    <tr key={producto.id ?? producto.nombre} className="border-t border-[#d8e8f7] even:bg-[#f8fbff]">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#082758]">{producto.nombre}</td>
                      <td className="px-4 py-3 text-sm">{producto.stock}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(producto.precio)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{producto.descripcion ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
