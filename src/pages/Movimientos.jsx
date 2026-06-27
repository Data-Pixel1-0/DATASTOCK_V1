import { useEffect, useMemo, useState } from "react";
import { createMovimiento, getMovimientos, getProductos } from "../services/api.js";
import { canAccess, getCurrentUser } from "../utils/auth.js";

function getCurrentDateTimeValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const emptyForm = {
  producto_id: "",
  tipo: "entrada",
  cantidad: "",
  fecha: getCurrentDateTimeValue(),
};

function Movimientos() {
  const user = getCurrentUser();
  const canCreate = canAccess("create-movements", user) || canAccess("manage-products", user);
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadData() {
    setLoading(true);
    setMessage(null);
    try {
      const productosData = await getProductos();
      setProductos(Array.isArray(productosData) ? productosData : []);
      try {
        const movimientosData = await getMovimientos();
        setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
      } catch (movimientosError) {
        setMovimientos([]);
        setMessage({
          type: "error",
          text:
            movimientosError.message ||
            "No se pudieron cargar los movimientos. Reinicia el backend para activar este modulo.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "No se pudieron cargar los productos." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const updateCurrentDateTime = () => {
      setFormData((current) => ({ ...current, fecha: getCurrentDateTimeValue() }));
    };

    updateCurrentDateTime();
    const timerId = window.setInterval(updateCurrentDateTime, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const selectedProduct = useMemo(
    () => productos.find((producto) => String(producto.id) === String(formData.producto_id)),
    [formData.producto_id, productos]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!canCreate) {
      setMessage({ type: "error", text: "Tu rol no permite registrar movimientos." });
      return;
    }

    if (!formData.producto_id || !formData.cantidad) {
      setMessage({ type: "error", text: "Selecciona un producto e ingresa una cantidad." });
      return;
    }

    setSaving(true);
    try {
      await createMovimiento({
        ...formData,
        usuario_id: user?.id,
        usuario_nombre: user?.nombre || user?.usuario || "Usuario",
      });
      setMessage({ type: "success", text: "Movimiento registrado y stock actualizado." });
      setFormData({ ...emptyForm, fecha: getCurrentDateTimeValue() });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Inventario</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="theme-heading text-3xl font-bold text-[#082758]">Movimientos</h1>
            <p className="theme-muted mt-2 max-w-2xl text-slate-500">
              Registra entradas y salidas de productos con trazabilidad por fecha y usuario.
            </p>
          </div>
          <div className="rounded-2xl bg-[#eef6ff] px-4 py-3 text-sm font-bold text-[#082758]">
            {loading ? "Cargando..." : `${movimientos.length} movimientos`}
          </div>
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-semibold ${message.type === "success" ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleSubmit} className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Registro</p>
          <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">Nuevo movimiento</h2>
          {!canCreate && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Tu rol es de consulta. Puedes visualizar movimientos, pero no registrar cambios.
            </p>
          )}

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="theme-heading text-sm font-bold text-[#082758]">Producto</span>
              <select
                name="producto_id"
                value={formData.producto_id}
                onChange={handleChange}
                disabled={!canCreate}
                className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10 disabled:opacity-60"
              >
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - Stock {producto.stock}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="theme-heading text-sm font-bold text-[#082758]">Tipo</span>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  disabled={!canCreate}
                  className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10 disabled:opacity-60"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </label>

              <label className="block">
                <span className="theme-heading text-sm font-bold text-[#082758]">Cantidad</span>
                <input
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  disabled={!canCreate}
                  type="number"
                  min="1"
                  className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10 disabled:opacity-60"
                />
              </label>
            </div>

            <label className="block">
              <span className="theme-heading text-sm font-bold text-[#082758]">Fecha</span>
              <input
                name="fecha"
                value={formData.fecha}
                readOnly
                disabled={!canCreate}
                type="datetime-local"
                className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10 disabled:opacity-60"
              />
            </label>

            {selectedProduct && (
              <div className="rounded-2xl border border-[#bfe5a4] bg-[#f1f9eb] p-4 text-sm text-[#2f7d1f]">
                Stock actual: <strong>{selectedProduct.stock}</strong>. Stock minimo: <strong>{selectedProduct.stock_minimo ?? 5}</strong>.
              </div>
            )}

            <button
              type="submit"
              disabled={!canCreate || saving}
              className="w-full rounded-2xl bg-[#69b523] px-5 py-3 font-bold text-white shadow-lg shadow-[#69b523]/25 transition hover:-translate-y-0.5 hover:bg-[#5ca11d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Registrando..." : "Registrar movimiento"}
            </button>
          </div>
        </form>

        <section className="theme-card overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
          <div className="border-b border-[#d8e8f7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Historial</p>
            <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">Ultimos movimientos</h2>
          </div>

          {loading ? (
            <p className="p-6 text-[#082758]">Cargando movimientos...</p>
          ) : movimientos.length === 0 ? (
            <p className="p-6 text-slate-500">Aun no hay movimientos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#eef6ff] text-[#082758]">
                  <tr>
                    {["Producto", "Tipo", "Cantidad", "Fecha", "Usuario"].map((column) => (
                      <th key={column} className="px-4 py-3 text-sm font-bold">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id} className="border-t border-[#d8e8f7] even:bg-[#f8fbff]">
                      <td className="px-4 py-3 text-sm font-semibold text-[#082758]">{movimiento.producto}</td>
                      <td className="px-4 py-3 text-sm capitalize">
                        <span className={`rounded-full px-3 py-1 font-bold ${movimiento.tipo === "entrada" ? "bg-[#f1f9eb] text-[#2f7d1f]" : "bg-amber-50 text-amber-800"}`}>
                          {movimiento.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{movimiento.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(movimiento.fecha).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{movimiento.usuario || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default Movimientos;
