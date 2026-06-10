import { useEffect, useState } from "react";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../services/api";

const emptyForm = { nombre: "", descripcion: "", precio: "", stock: "" };

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [currentProducto, setCurrentProducto] = useState(null);
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

  const getProductoId = (producto) => producto?.id ?? producto?.identificacion ?? producto?.ID;

  const openCreateForm = () => {
    setFormMode("create");
    setCurrentProducto(null);
    setFormData(emptyForm);
    setMessage(null);
    setFormOpen(true);
  };

  const openEditForm = (producto) => {
    setFormMode("edit");
    setCurrentProducto(producto);
    setFormData({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio?.toString() || "",
      stock: producto.stock?.toString() || "",
    });
    setMessage(null);
    setFormOpen(true);
  };

  const handleDelete = async (productoId) => {
    const id = productoId ?? null;
    if (!id) {
      setMessage({ type: "error", text: "No se pudo identificar el producto a eliminar." });
      return;
    }

    if (!window.confirm("¿Eliminar este producto?")) {
      return;
    }

    try {
      await deleteProducto(id);
      setMessage({ type: "success", text: "Producto eliminado." });
      await loadProductos();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!formData.nombre || !formData.descripcion || !formData.precio || !formData.stock) {
      setMessage({ type: "error", text: "Complete todos los campos." });
      return;
    }

    try {
      if (formMode === "create") {
        await createProducto({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio: formData.precio,
          stock: formData.stock,
        });
        setMessage({ type: "success", text: "Producto creado correctamente." });
      } else if (currentProducto) {
        await updateProducto(currentProducto.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio: formData.precio,
          stock: formData.stock,
        });
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

  const columns = ["id", "nombre", "descripcion", "precio", "stock"];

  return (
    <div className="space-y-7">
      <div className="rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Inventario</p>
          <h1 className="mt-2 text-3xl font-bold text-[#082758]">Productos</h1>
          <p className="mt-2 text-slate-500">Administra tus productos: crear, editar y eliminar.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-2xl bg-[#69b523] px-5 py-3 font-semibold text-white shadow-lg shadow-[#69b523]/25 transition hover:-translate-y-0.5 hover:bg-[#5ca11d]"
        >
          Nuevo producto
        </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 ${message.type === "success" ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message.text}
        </div>
      )}

      {formOpen && (
        <div className="rounded-[32px] border border-[#d8e8f7] bg-white p-8 shadow-xl shadow-[#082758]/8">
          <h2 className="mb-4 text-2xl font-bold text-[#082758]">
            {formMode === "create" ? "Crear producto" : "Editar producto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#082758]">Nombre</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 shadow-sm outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#082758]">Descripcion</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 shadow-sm outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#082758]">Precio</label>
                <input
                  name="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 shadow-sm outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#082758]">Stock</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-2xl border border-[#d8e8f7] px-4 py-3 shadow-sm outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-2xl border border-[#d8e8f7] px-5 py-3 font-semibold text-[#082758] transition hover:bg-[#eef6ff]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-[#2f7fd3] px-5 py-3 font-semibold text-white shadow-lg shadow-[#2f7fd3]/25 transition hover:bg-[#236bb7]"
              >
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
        {loading ? (
          <p className="text-[#082758]">Cargando productos...</p>
        ) : error ? (
          <p className="text-rose-700">{error}</p>
        ) : productos.length === 0 ? (
          <p className="text-slate-500">No se encontraron productos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse overflow-hidden rounded-2xl">
              <thead>
                <tr className="bg-[#eef6ff] text-[#082758]">
                  {columns.map((column) => (
                    <th key={column} className="border-b border-[#d8e8f7] px-4 py-3 text-left capitalize">
                      {column}
                    </th>
                  ))}
                  <th className="border-b border-[#d8e8f7] px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={getProductoId(producto)} className="border-b border-[#d8e8f7] even:bg-[#f8fbff]">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-[#082758]">{producto.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{producto.descripcion}</td>
                    <td className="px-4 py-3">{producto.precio}</td>
                    <td className="px-4 py-3">{producto.stock}</td>
                    <td className="space-x-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(producto)}
                        className="rounded-xl bg-[#2f7fd3] px-3 py-2 text-white transition hover:bg-[#236bb7]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(getProductoId(producto))}
                        className="rounded-xl bg-rose-500 px-3 py-2 text-white transition hover:bg-rose-600"
                      >
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
    </div>
  );
}

export default Productos;
