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
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-gray-600 mt-2">Administra tus productos aquí: crear, editar y eliminar.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-green-500 px-5 py-3 text-white hover:bg-green-600"
        >
          Nuevo producto
        </button>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {formOpen && (
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">
            {formMode === "create" ? "Crear producto" : "Editar producto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  name="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
              >
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
        {loading ? (
          <p>Cargando productos...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : productos.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  {columns.map((column) => (
                    <th key={column} className="border px-4 py-3 text-left capitalize">
                      {column}
                    </th>
                  ))}
                  <th className="border px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={getProductoId(producto)} className="even:bg-slate-50">
                    <td className="border px-4 py-3">{getProductoId(producto)}</td>
                    <td className="border px-4 py-3">{producto.nombre}</td>
                    <td className="border px-4 py-3">{producto.descripcion}</td>
                    <td className="border px-4 py-3">{producto.precio}</td>
                    <td className="border px-4 py-3">{producto.stock}</td>
                    <td className="border px-4 py-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(producto)}
                        className="rounded-xl bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(getProductoId(producto))}
                        className="rounded-xl bg-red-500 px-3 py-2 text-white hover:bg-red-600"
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
