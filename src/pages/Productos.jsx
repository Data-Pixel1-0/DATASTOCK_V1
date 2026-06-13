import { useEffect, useMemo, useState } from "react";
import { createProducto, deleteProducto, getProductoDetalle, getProductos, updateProducto } from "../services/api.js";
import { canAccess, getCurrentUser } from "../utils/auth.js";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  codigo: "",
  categoria: "General",
  imagen: "",
  stock_minimo: "5",
};

const statusStyles = {
  Disponible: "bg-[#f1f9eb] text-[#2f7d1f]",
  "Bajo stock": "bg-amber-50 text-amber-800",
  Agotado: "bg-rose-50 text-rose-800",
};

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:|data:image\/|blob:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `https://${url}`;
}

function ProductImage({ src, alt, fallback }) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = normalizeImageUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [imageSrc]);

  if (!imageSrc || hasError) {
    return (
      <div className="flex h-48 items-center justify-center px-4 text-center text-sm font-semibold text-[#082758]">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="h-48 w-full object-contain"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}

function Productos() {
  const user = getCurrentUser();
  const canManage = canAccess("manage-products", user);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [currentProducto, setCurrentProducto] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

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

  const categories = useMemo(
    () => [...new Set(productos.map((producto) => producto.categoria || "General"))],
    [productos]
  );

  const formImagePreview = useMemo(() => normalizeImageUrl(formData.imagen), [formData.imagen]);

  const openCreateForm = () => {
    if (!canManage) {
      setMessage({ type: "error", text: "Tu rol no permite crear productos." });
      return;
    }

    setFormMode("create");
    setCurrentProducto(null);
    setFormData(emptyForm);
    setMessage(null);
    setFormOpen(true);
  };

  const openEditForm = (producto) => {
    if (!canManage) {
      setMessage({ type: "error", text: "Tu rol no permite editar productos." });
      return;
    }

    setFormMode("edit");
    setCurrentProducto(producto);
    setFormData({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio?.toString() || "",
      stock: producto.stock?.toString() || "",
      codigo: producto.codigo || "",
      categoria: producto.categoria || "General",
      imagen: normalizeImageUrl(producto.imagen),
      stock_minimo: producto.stock_minimo?.toString() || "5",
    });
    setMessage(null);
    setFormOpen(true);
  };

  const openDetail = async (producto) => {
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const data = await getProductoDetalle(producto.id);
      setSelectedDetail(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "No se pudo cargar el detalle." });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (productoId) => {
    if (!canManage) {
      setMessage({ type: "error", text: "Tu rol no permite eliminar productos." });
      return;
    }

    if (!productoId || !window.confirm("Eliminar este producto?")) {
      return;
    }

    try {
      await deleteProducto(productoId);
      setMessage({ type: "success", text: "Producto eliminado." });
      setSelectedDetail(null);
      await loadProductos();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!formData.nombre || !formData.descripcion || !formData.precio || formData.stock === "") {
      setMessage({ type: "error", text: "Completa nombre, descripcion, precio y stock." });
      return;
    }

    try {
      const payload = {
        ...formData,
        imagen: normalizeImageUrl(formData.imagen),
      };

      if (formMode === "create") {
        await createProducto(payload);
        setMessage({ type: "success", text: "Producto creado correctamente." });
      } else if (currentProducto) {
        await updateProducto(currentProducto.id, payload);
        setMessage({ type: "success", text: "Producto actualizado correctamente." });
      }
      setFormOpen(false);
      await loadProductos();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-7">
      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Inventario</p>
            <h1 className="theme-heading mt-2 text-3xl font-bold text-[#082758]">Productos</h1>
            <p className="theme-muted mt-2 text-slate-500">Administra productos, categorias, stock minimo e historial.</p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-2xl bg-[#69b523] px-5 py-3 font-semibold text-white shadow-lg shadow-[#69b523]/25 transition hover:-translate-y-0.5 hover:bg-[#5ca11d] disabled:opacity-60"
            disabled={!canManage}
          >
            Nuevo producto
          </button>
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-semibold ${message.type === "success" ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message.text}
        </div>
      )}

      {!canManage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Tu rol permite consultar productos. La creacion, edicion y eliminacion esta reservada al administrador.
        </div>
      )}

      {formOpen && (
        <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-8 shadow-xl shadow-[#082758]/8">
          <h2 className="theme-heading mb-4 text-2xl font-bold text-[#082758]">
            {formMode === "create" ? "Crear producto" : "Editar producto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Nombre</span>
                <input name="nombre" value={formData.nombre} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Codigo</span>
                <input name="codigo" value={formData.codigo} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
              </label>
            </div>

            <label className="block">
              <span className="theme-heading text-sm font-semibold text-[#082758]">Descripcion</span>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
            </label>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Precio</span>
                <input name="precio" type="number" min="0" step="0.01" value={formData.precio} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Stock</span>
                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Stock minimo</span>
                <input name="stock_minimo" type="number" min="0" value={formData.stock_minimo} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-semibold text-[#082758]">Categoria</span>
                <input name="categoria" list="categorias" value={formData.categoria} onChange={handleChange} className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
                <datalist id="categorias">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>
            </div>

            <label className="block">
              <span className="theme-heading text-sm font-semibold text-[#082758]">URL de imagen</span>
              <input name="imagen" value={formData.imagen} onChange={handleChange} placeholder="https://..." className="theme-input mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 outline-none focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10" />
            </label>

            {formImagePreview && (
              <div className="overflow-hidden rounded-[24px] border border-[#d8e8f7] bg-[#eef6ff]">
                <ProductImage src={formImagePreview} alt="Vista previa del producto" fallback="No se pudo cargar la vista previa de esta URL." />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-2xl border border-[#d8e8f7] px-5 py-3 font-semibold text-[#082758] transition hover:bg-[#eef6ff]">
                Cancelar
              </button>
              <button type="submit" className="rounded-2xl bg-[#2f7fd3] px-5 py-3 font-semibold text-white shadow-lg shadow-[#2f7fd3]/25 transition hover:bg-[#236bb7]">
                Guardar producto
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="theme-card overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8">
          {loading ? (
            <p className="p-6 text-[#082758]">Cargando productos...</p>
          ) : error ? (
            <p className="p-6 text-rose-700">{error}</p>
          ) : productos.length === 0 ? (
            <p className="p-6 text-slate-500">No se encontraron productos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-[#eef6ff] text-[#082758]">
                  <tr>
                    {["Producto", "Codigo", "Categoria", "Precio", "Stock", "Estado", "Acciones"].map((column) => (
                      <th key={column} className="border-b border-[#d8e8f7] px-4 py-3 text-sm font-bold">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b border-[#d8e8f7] even:bg-[#f8fbff]">
                      <td className="px-4 py-3 font-semibold text-[#082758]">{producto.nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{producto.codigo || "-"}</td>
                      <td className="px-4 py-3 text-sm">{producto.categoria || "General"}</td>
                      <td className="px-4 py-3 text-sm">{producto.precio}</td>
                      <td className="px-4 py-3 text-sm">{producto.stock}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-3 py-1 font-bold ${statusStyles[producto.estado] || statusStyles.Disponible}`}>
                          {producto.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button type="button" onClick={() => openDetail(producto)} className="mr-2 rounded-xl bg-[#082758] px-3 py-2 text-sm text-white transition hover:bg-[#0b3474]">
                          Ver
                        </button>
                        <button type="button" onClick={() => openEditForm(producto)} disabled={!canManage} className="mr-2 rounded-xl bg-[#2f7fd3] px-3 py-2 text-sm text-white transition hover:bg-[#236bb7] disabled:opacity-50">
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDelete(producto.id)} disabled={!canManage} className="rounded-xl bg-rose-500 px-3 py-2 text-sm text-white transition hover:bg-rose-600 disabled:opacity-50">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Detalle</p>
          <h2 className="theme-heading mt-2 text-2xl font-bold text-[#082758]">Producto seleccionado</h2>
          {detailLoading ? (
            <p className="mt-5 text-[#082758]">Cargando detalle...</p>
          ) : !selectedDetail ? (
            <p className="theme-muted mt-5 text-sm leading-6 text-slate-500">Selecciona un producto para ver imagen, estado completo e historial.</p>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="overflow-hidden rounded-[24px] border border-[#d8e8f7] bg-[#eef6ff]">
                {selectedDetail.producto.imagen ? (
                  <ProductImage src={selectedDetail.producto.imagen} alt={selectedDetail.producto.nombre} fallback="Imagen no disponible. Revisa que la URL sea directa y publica." />
                ) : (
                  <div className="flex h-48 items-center justify-center text-4xl font-bold text-[#082758]">
                    {selectedDetail.producto.nombre?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="theme-heading text-xl font-bold text-[#082758]">{selectedDetail.producto.nombre}</h3>
                <p className="theme-muted mt-2 text-sm leading-6 text-slate-500">{selectedDetail.producto.descripcion}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Codigo", selectedDetail.producto.codigo || "-"],
                  ["Categoria", selectedDetail.producto.categoria || "General"],
                  ["Precio", selectedDetail.producto.precio],
                  ["Stock actual", selectedDetail.producto.stock],
                  ["Stock minimo", selectedDetail.producto.stock_minimo],
                  ["Estado", selectedDetail.producto.estado],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7fd3]">{label}</p>
                    <p className="theme-heading mt-2 font-bold text-[#082758]">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="theme-heading font-bold text-[#082758]">Historial del producto</h4>
                <div className="mt-3 space-y-2">
                  {selectedDetail.historial.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
                  ) : (
                    selectedDetail.historial.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[#d8e8f7] p-3 text-sm">
                        <p className="font-bold capitalize text-[#082758]">{item.tipo} de {item.cantidad}</p>
                        <p className="text-slate-500">{new Date(item.fecha).toLocaleString()} por {item.usuario || "Sistema"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default Productos;
