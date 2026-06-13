import { useEffect, useMemo, useState } from "react";
import { getMovimientos, getProductos } from "../services/api.js";

const reportTypes = {
  general: "Reporte general de inventario",
  agotados: "Productos agotados",
  movimientos: "Historial de movimientos",
};

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

function Reportes() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [reportType, setReportType] = useState("general");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [productosData, movimientosData] = await Promise.all([getProductos(), getMovimientos()]);
        setProductos(Array.isArray(productosData) ? productosData : []);
        setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
      } catch (error) {
        setMessage({ type: "error", text: error.message || "No se pudieron cargar los reportes." });
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const rows = useMemo(() => {
    if (reportType === "agotados") {
      return productos
        .filter((producto) => Number(producto.stock) <= 0)
        .map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo || "",
          categoria: producto.categoria || "General",
          stock: producto.stock,
          estado: producto.estado,
        }));
    }

    if (reportType === "movimientos") {
      return movimientos.map((movimiento) => ({
        producto: movimiento.producto,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        fecha: new Date(movimiento.fecha).toLocaleString(),
        usuario: movimiento.usuario || "",
      }));
    }

    return productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo || "",
      categoria: producto.categoria || "General",
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      estado: producto.estado,
    }));
  }, [movimientos, productos, reportType]);

  const totals = useMemo(() => {
    const valor = productos.reduce((sum, producto) => sum + (Number(producto.precio) || 0) * (Number(producto.stock) || 0), 0);
    return {
      productos: productos.length,
      agotados: productos.filter((producto) => Number(producto.stock) <= 0).length,
      movimientos: movimientos.length,
      valor,
    };
  }, [movimientos, productos]);

  const handleExportCsv = () => {
    downloadFile(`${reportType}-datastock.csv`, toCsv(rows), "text/csv;charset=utf-8");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-7">
      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Analisis</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="theme-heading text-3xl font-bold text-[#082758]">Reportes</h1>
            <p className="theme-muted mt-2 max-w-2xl text-slate-500">
              Genera reportes de inventario, productos agotados e historial de movimientos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={handleExportCsv} type="button" className="rounded-2xl bg-[#69b523] px-5 py-3 font-bold text-white shadow-lg shadow-[#69b523]/25 transition hover:-translate-y-0.5 hover:bg-[#5ca11d]">
              Exportar Excel
            </button>
            <button onClick={handlePrint} type="button" className="rounded-2xl bg-[#082758] px-5 py-3 font-bold text-white shadow-lg shadow-[#082758]/20 transition hover:-translate-y-0.5 hover:bg-[#0b3474]">
              Exportar PDF
            </button>
          </div>
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-semibold ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]"}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          ["Productos", totals.productos],
          ["Agotados", totals.agotados],
          ["Movimientos", totals.movimientos],
          ["Valor", new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totals.valor)],
        ].map(([label, value]) => (
          <article key={label} className="theme-card rounded-[28px] border border-[#d8e8f7] bg-white p-5 shadow-xl shadow-[#082758]/8">
            <p className="theme-muted text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="theme-heading mt-3 text-2xl font-bold text-[#082758]">{loading ? "..." : value}</p>
          </article>
        ))}
      </section>

      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Tipo de reporte</p>
            <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">{reportTypes[reportType]}</h2>
          </div>
          <select
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            className="theme-input rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
          >
            {Object.entries(reportTypes).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#d8e8f7]">
          {loading ? (
            <p className="p-6 text-[#082758]">Cargando reporte...</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-slate-500">No hay datos para este reporte.</p>
          ) : (
            <table className="min-w-full text-left">
              <thead className="bg-[#eef6ff] text-[#082758]">
                <tr>
                  {Object.keys(rows[0]).map((column) => (
                    <th key={column} className="px-4 py-3 text-sm font-bold capitalize">{column.replace("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-[#d8e8f7] even:bg-[#f8fbff]">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-slate-600">{value || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default Reportes;
