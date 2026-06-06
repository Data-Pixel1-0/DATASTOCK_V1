import { useNavigate } from "react-router-dom";

function Configuracion() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-gray-600 mt-2">Administra los ajustes de tu cuenta y cierra sesión cuando lo necesites.</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-slate-900">Sección de configuración</h2>
        <p className="mt-3 text-gray-600">
          Aquí podrás añadir opciones de configuración más adelante. Por ahora puedes usar el botón para cerrar sesión y volver a la pantalla de inicio.
        </p>
      </div>
    </div>
  );
}

export default Configuracion;
