import { useEffect, useMemo, useState } from "react";
import { getMovimientos, getProductos } from "../services/api.js";

const companyName = "Data Stock";

const reportTypes = {
  general: "Reporte general de inventario",
  agotados: "Productos agotados",
  movimientos: "Historial de movimientos",
};

const columnLabels = {
  id: "ID",
  nombre: "Nombre",
  codigo: "Codigo",
  categoria: "Categoria",
  precio: "Precio",
  stock: "Stock",
  stock_minimo: "Stock minimo",
  estado: "Estado",
  producto: "Producto",
  tipo: "Tipo",
  cantidad: "Cantidad",
  fecha: "Fecha",
  usuario: "Usuario",
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCell(column, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (column === "precio") return currencyFormatter.format(Number(value) || 0);
  if (column === "tipo") return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  return value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getColumns(rows) {
  return rows.length ? Object.keys(rows[0]) : [];
}

function buildReportHtml({ rows, reportType, totals, forExcel = false }) {
  const columns = getColumns(rows);
  const generatedAt = formatDateTime(new Date());
  const title = reportTypes[reportType];
  const totalsRows = [
    ["Productos", totals.productos],
    ["Agotados", totals.agotados],
    ["Movimientos", totals.movimientos],
    ["Valor inventario", currencyFormatter.format(totals.valor)],
  ];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; color: #082758; font-family: Arial, Helvetica, sans-serif; background: #ffffff; }
    .page { padding: ${forExcel ? "18px" : "34px"}; }
    .header { border-bottom: 4px solid #69b523; padding-bottom: 18px; display: flex; justify-content: space-between; gap: 24px; }
    .brand { color: #082758; font-size: 24px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
    .subtitle { margin-top: 8px; color: #64748b; font-size: 13px; }
    .title { margin: 26px 0 8px; font-size: 28px; font-weight: 800; }
    .meta { color: #475569; font-size: 13px; }
    .summary { margin: 22px 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .metric { border: 1px solid #d8e8f7; border-radius: 12px; padding: 12px; background: #f8fbff; }
    .metric-label { color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
    .metric-value { margin-top: 6px; font-size: 18px; font-weight: 800; color: #082758; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
    th { background: #082758; color: #ffffff; padding: 10px; text-align: left; border: 1px solid #082758; }
    td { padding: 9px 10px; border: 1px solid #d8e8f7; color: #334155; }
    tr:nth-child(even) td { background: #f8fbff; }
    .empty { margin-top: 24px; border: 1px solid #d8e8f7; border-radius: 12px; padding: 18px; color: #64748b; }
    .footer { margin-top: 24px; color: #64748b; font-size: 11px; border-top: 1px solid #d8e8f7; padding-top: 12px; }
    @media print {
      @page { size: landscape; margin: 12mm; }
      .page { padding: 0; }
      .summary { grid-template-columns: repeat(4, 1fr); }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">${companyName}</div>
        <div class="subtitle">Tu inventario, bajo control.</div>
      </div>
      <div class="meta">
        <strong>Generado:</strong> ${escapeHtml(generatedAt)}<br />
        <strong>Formato:</strong> ${forExcel ? "Excel" : "PDF"}
      </div>
    </div>
    <h1 class="title">${escapeHtml(title)}</h1>
    <div class="meta">Reporte consolidado de inventario y actividad operativa.</div>
    <div class="summary">
      ${totalsRows
        .map(
          ([label, value]) => `<div class="metric"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div></div>`
        )
        .join("")}
    </div>
    ${
      rows.length
        ? `<table>
            <thead><tr>${columns.map((column) => `<th>${escapeHtml(columnLabels[column] || column)}</th>`).join("")}</tr></thead>
            <tbody>
              ${rows
                .map(
                  (row) =>
                    `<tr>${columns
                      .map((column) => `<td>${escapeHtml(formatCell(column, row[column]))}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : `<div class="empty">No hay datos para este reporte.</div>`
    }
    <div class="footer">Documento generado automaticamente por Data Stock.</div>
  </div>
</body>
</html>`;
}

function openPrintReport(reportHtml) {
  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(reportHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
  return true;
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
        fecha: formatDateTime(movimiento.fecha),
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
    const html = buildReportHtml({ rows, reportType, totals, forExcel: true });
    downloadFile(`${reportType}-datastock.xls`, html, "application/vnd.ms-excel;charset=utf-8");
  };

  const handlePrint = () => {
    const html = buildReportHtml({ rows, reportType, totals });
    const opened = openPrintReport(html);
    if (!opened) {
      setMessage({ type: "error", text: "Permite ventanas emergentes para generar el PDF." });
    }
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
                    <th key={column} className="px-4 py-3 text-sm font-bold">{columnLabels[column] || column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-[#d8e8f7] even:bg-[#f8fbff]">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-slate-600">{formatCell(Object.keys(row)[cellIndex], value)}</td>
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
