import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../utils/auth.js";
import { getDashboard, sendAlertEmail } from "../services/api.js";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function Bar({ value, max, color = "bg-[#2f7fd3]" }) {
  const width = max > 0 ? Math.max((Number(value) / max) * 100, 6) : 0;
  return (
    <div className="h-3 rounded-full bg-[#eef6ff]">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${width}%` }} />
    </div>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        setDashboard(await getDashboard());
      } catch (err) {
        setError(err.message || "No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    if (loading || !dashboard?.alertas?.length) return;

    let preferences = { emailNotifications: true };
    try {
      preferences = {
        ...preferences,
        ...(JSON.parse(localStorage.getItem("datastock-preferences")) || {}),
      };
    } catch {
      preferences = { emailNotifications: true };
    }

    if (!preferences.emailNotifications) return;

    const user = getCurrentUser();
    if (!user?.id || !user?.email) return;

    const today = new Date().toISOString().slice(0, 10);
    const alertSignature = dashboard.alertas.map((alerta) => `${alerta.tipo}-${alerta.producto_id}`).join("|");
    const storageKey = `datastock-alert-email-${user.id}-${today}`;
    if (localStorage.getItem(storageKey) === alertSignature) return;

    sendAlertEmail(user.id)
      .then(() => {
        localStorage.setItem(storageKey, alertSignature);
      })
      .catch((err) => {
        console.warn("No se pudo enviar el correo de alertas:", err.message);
      });
  }, [dashboard, loading]);

  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};
  const alertas = dashboard?.alertas || [];
  const movimientos = dashboard?.movimientos || [];

  const maxFecha = useMemo(
    () => Math.max(1, ...(charts.movimientosPorFecha || []).map((item) => Math.max(Number(item.entradas) || 0, Number(item.salidas) || 0))),
    [charts.movimientosPorFecha]
  );
  const maxMovimiento = useMemo(
    () => Math.max(1, ...(charts.mayorMovimiento || []).map((item) => Number(item.total) || 0)),
    [charts.mayorMovimiento]
  );
  const maxCategoria = useMemo(
    () => Math.max(1, ...(charts.porCategoria || []).map((item) => Number(item.stock) || Number(item.productos) || 0)),
    [charts.porCategoria]
  );

  const metricCards = [
    {
      label: "Total de productos",
      value: stats.totalProductos ?? 0,
      helper: "Productos registrados",
      color: "from-[#2f7fd3] to-[#082758]",
    },
    {
      label: "Valor total",
      value: currencyFormatter.format(stats.valorInventario || 0),
      helper: "Precio por stock disponible",
      color: "from-[#082758] to-[#184f9c]",
    },
    {
      label: "Stock bajo",
      value: stats.stockBajo ?? 0,
      helper: "Requieren reposicion",
      color: "from-amber-500 to-[#69b523]",
    },
    {
      label: "Movimientos recientes",
      value: stats.movimientosRecientes ?? 0,
      helper: "Ultima actividad registrada",
      color: "from-[#69b523] to-[#2f7d1f]",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="theme-card overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
        <div className="bg-[linear-gradient(135deg,_#082758_0%,_#2f7fd3_58%,_#69b523_100%)] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100">Dashboard</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Gestion profesional de inventario</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-50">
                Controla existencias, valor, movimientos y alertas criticas desde una vista centralizada.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/15 px-5 py-4 backdrop-blur">
              <p className="text-sm text-blue-50">Estado general</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "Cargando..." : `${stats.agotados || 0} agotados`}</p>
            </div>
          </div>
        </div>

        {error && <p className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</p>}

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <article key={card.label} className="theme-card group overflow-hidden rounded-[28px] border border-[#d8e8f7] bg-white shadow-lg shadow-[#082758]/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <div className="p-6">
                <p className="theme-muted text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className="theme-heading mt-4 text-3xl font-bold text-[#082758]">{loading ? "..." : card.value}</p>
                <p className="theme-muted mt-2 text-sm text-slate-500">{card.helper}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Centro de notificaciones</p>
          <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">Alertas de inventario</h2>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="rounded-2xl bg-[#eef6ff] p-4 text-[#082758]">Cargando alertas...</p>
            ) : alertas.length === 0 ? (
              <p className="rounded-2xl border border-[#bfe5a4] bg-[#f1f9eb] p-4 font-semibold text-[#2f7d1f]">
                No hay alertas criticas en este momento.
              </p>
            ) : (
              alertas.map((alerta) => (
                <div
                  key={`${alerta.tipo}-${alerta.producto_id}`}
                  className={`rounded-2xl border p-4 ${alerta.severidad === "danger" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
                >
                  <p className="font-bold">{alerta.mensaje}</p>
                  <p className="mt-1 text-sm opacity-80">Revision recomendada para compras o reposicion.</p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="theme-card overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
          <div className="border-b border-[#d8e8f7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Actividad</p>
            <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">Movimientos recientes</h2>
          </div>
          {loading ? (
            <p className="p-6 text-[#082758]">Cargando movimientos...</p>
          ) : movimientos.length === 0 ? (
            <p className="p-6 text-slate-500">No hay movimientos registrados.</p>
          ) : (
            <div className="divide-y divide-[#d8e8f7]">
              {movimientos.slice(0, 6).map((movimiento) => (
                <div key={movimiento.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="theme-heading font-bold text-[#082758]">{movimiento.producto}</p>
                    <p className="theme-muted text-sm text-slate-500">{new Date(movimiento.fecha).toLocaleString()} por {movimiento.usuario_nombre || "Sistema"}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold capitalize ${movimiento.tipo === "entrada" ? "bg-[#f1f9eb] text-[#2f7d1f]" : "bg-amber-50 text-amber-800"}`}>
                    {movimiento.tipo} {movimiento.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Flujo</p>
          <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Entradas y salidas por fecha</h2>
          <div className="mt-5 space-y-4">
            {(charts.movimientosPorFecha || []).map((item) => (
              <div key={item.fecha} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-[#082758]">
                  <span>{new Date(item.fecha).toLocaleDateString()}</span>
                  <span>{Number(item.entradas) || 0} / {Number(item.salidas) || 0}</span>
                </div>
                <Bar value={item.entradas} max={maxFecha} color="bg-[#69b523]" />
                <Bar value={item.salidas} max={maxFecha} color="bg-[#2f7fd3]" />
              </div>
            ))}
            {!loading && (charts.movimientosPorFecha || []).length === 0 && <p className="text-sm text-slate-500">Sin datos para graficar.</p>}
          </div>
        </article>

        <article className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Rotacion</p>
          <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Productos con mayor movimiento</h2>
          <div className="mt-5 space-y-4">
            {(charts.mayorMovimiento || []).map((item) => (
              <div key={item.nombre} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-[#082758]">
                  <span className="truncate pr-3">{item.nombre}</span>
                  <span>{Number(item.total) || 0}</span>
                </div>
                <Bar value={item.total} max={maxMovimiento} />
              </div>
            ))}
            {!loading && (charts.mayorMovimiento || []).length === 0 && <p className="text-sm text-slate-500">Sin movimientos acumulados.</p>}
          </div>
        </article>

        <article className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Categorias</p>
          <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Inventario por categorias</h2>
          <div className="mt-5 space-y-4">
            {(charts.porCategoria || []).map((item) => (
              <div key={item.categoria} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-[#082758]">
                  <span>{item.categoria}</span>
                  <span>{Number(item.stock) || 0} uds</span>
                </div>
                <Bar value={Number(item.stock) || Number(item.productos) || 0} max={maxCategoria} color="bg-[#082758]" />
              </div>
            ))}
            {!loading && (charts.porCategoria || []).length === 0 && <p className="text-sm text-slate-500">Sin categorias registradas.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
