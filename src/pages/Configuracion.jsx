import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useTheme } from "../context/useTheme.js";
import { changePassword } from "../services/api.js";

const defaultPreferences = {
  defaultView: "dashboard",
  stockAlert: "10",
  currency: "COP",
  reportFrequency: "weekly",
  emailNotifications: true,
  compactTables: false,
};

const preferenceLabels = {
  dashboard: "Panel inicial",
  productos: "Productos",
  reportes: "Reportes",
  COP: "Peso colombiano",
  USD: "Dolar estadounidense",
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
};

function getInitials(name = "DS") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Configuracion() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("datastock-user")) || null;
    } catch {
      return null;
    }
  });
  const [preferences, setPreferences] = useState(() => {
    try {
      return {
        ...defaultPreferences,
        ...(JSON.parse(localStorage.getItem("datastock-preferences")) || {}),
      };
    } catch {
      return defaultPreferences;
    }
  });

  const profile = useMemo(
    () => ({
      nombre: currentUser?.nombre || "Administrador Data Stock",
      usuario: currentUser?.usuario || "admin",
      email: currentUser?.email || "Sin correo registrado",
      rol: currentUser?.rol || "administrador",
    }),
    [currentUser]
  );

  const handleSignOut = () => {
    localStorage.removeItem("datastock-user");
    navigate("/");
  };

  const handlePreferenceChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPreferences((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSavedMessage("");
  };

  const handleSavePreferences = () => {
    localStorage.setItem("datastock-preferences", JSON.stringify(preferences));
    setSavedMessage("Preferencias guardadas correctamente.");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
    setPasswordMessage(null);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.id) {
      setPasswordMessage({ type: "error", text: "No se encontro el usuario de la sesion." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La nueva contrasena debe tener al menos 6 caracteres." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "La confirmacion no coincide." });
      return;
    }

    try {
      await changePassword({
        usuario_id: currentUser.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({ type: "success", text: "Contrasena actualizada correctamente." });
    } catch (error) {
      setPasswordMessage({ type: "error", text: error.message });
    }
  };

  const preferenceSummary = [
    { label: "Vista inicial", value: preferenceLabels[preferences.defaultView] },
    { label: "Alerta de stock", value: `${preferences.stockAlert} unidades` },
    { label: "Moneda", value: preferenceLabels[preferences.currency] },
  ];

  return (
    <div className="space-y-7">
      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Cuenta</p>
            <h1 className="theme-heading mt-2 text-3xl font-bold text-[#082758]">Configuracion</h1>
            <p className="theme-muted mt-2 text-slate-500">Administra los ajustes de tu cuenta y cierra sesion cuando lo necesites.</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-2xl bg-[#082758] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#082758]/20 transition hover:-translate-y-0.5 hover:bg-[#0b3474]"
          >
            Cerrar sesion
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Perfil</p>
              <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Cuenta administrativa</h2>
              <p className="theme-muted mt-3 text-sm leading-6 text-slate-500">
                Consulta la informacion principal del usuario que esta trabajando en el panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProfile((current) => !current)}
              className="rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] px-4 py-2 text-sm font-bold text-[#082758] transition hover:-translate-y-0.5 hover:bg-[#eef6ff]"
            >
              {showProfile ? "Ocultar perfil" : "Ver perfil"}
            </button>
          </div>

          {showProfile && (
            <div className="mt-6 rounded-[24px] border border-[#d8e8f7] bg-[#f8fbff] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#082758] text-xl font-bold text-white shadow-lg shadow-[#082758]/20">
                  {getInitials(profile.nombre)}
                </div>
                <div className="min-w-0">
                  <h3 className="theme-heading text-lg font-bold text-[#082758]">{profile.nombre}</h3>
                  <p className="theme-muted mt-1 text-sm text-slate-500">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-[#082758] shadow-sm">
                      {profile.rol}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#082758] shadow-sm">
                      @{profile.usuario}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="theme-card rounded-[32px] border border-[#bfe5a4] bg-[#f1f9eb] p-6 shadow-xl shadow-[#69b523]/10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7d1f]">Estado</p>
          <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Sesion activa</h2>
          <p className="theme-muted mt-3 text-sm leading-6 text-slate-600">
            Puedes volver a la pantalla inicial con el boton de cerrar sesion cuando termines tu trabajo.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {preferenceSummary.map((item) => (
              <div key={item.label} className="theme-soft rounded-2xl border border-[#bfe5a4] bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7d1f]">{item.label}</p>
                <p className="theme-heading mt-2 text-sm font-bold text-[#082758]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Sistema</p>
            <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Preferencias generales</h2>
            <p className="theme-muted mt-2 text-sm leading-6 text-slate-500">
              Ajusta el comportamiento del inventario y la forma en que quieres revisar la informacion diaria.
            </p>
          </div>
          {savedMessage && (
            <p className="rounded-full border border-[#bfe5a4] bg-[#f1f9eb] px-4 py-2 text-sm font-bold text-[#2f7d1f]">
              {savedMessage}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="theme-heading text-sm font-bold text-[#082758]">Vista inicial</span>
            <select
              name="defaultView"
              value={preferences.defaultView}
              onChange={handlePreferenceChange}
              className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
            >
              <option value="dashboard">Panel inicial</option>
              <option value="productos">Productos</option>
              <option value="reportes">Reportes</option>
            </select>
          </label>

          <label className="block">
            <span className="theme-heading text-sm font-bold text-[#082758]">Alerta de stock minimo</span>
            <input
              name="stockAlert"
              value={preferences.stockAlert}
              onChange={handlePreferenceChange}
              type="number"
              min="0"
              className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
            />
          </label>

          <label className="block">
            <span className="theme-heading text-sm font-bold text-[#082758]">Moneda de referencia</span>
            <select
              name="currency"
              value={preferences.currency}
              onChange={handlePreferenceChange}
              className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
            >
              <option value="COP">Peso colombiano</option>
              <option value="USD">Dolar estadounidense</option>
            </select>
          </label>

          <label className="block">
            <span className="theme-heading text-sm font-bold text-[#082758]">Frecuencia de reportes</span>
            <select
              name="reportFrequency"
              value={preferences.reportFrequency}
              onChange={handlePreferenceChange}
              className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
            >
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </label>

          <label className="theme-soft flex min-h-[92px] items-center justify-between gap-4 rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] p-4">
            <span>
              <span className="theme-heading block text-sm font-bold text-[#082758]">Notificaciones por correo</span>
              <span className="theme-muted mt-1 block text-xs leading-5 text-slate-500">Alertas de stock y actividad importante.</span>
            </span>
            <input
              name="emailNotifications"
              checked={preferences.emailNotifications}
              onChange={handlePreferenceChange}
              type="checkbox"
              className="h-5 w-5 accent-[#69b523]"
            />
          </label>

          <label className="theme-soft flex min-h-[92px] items-center justify-between gap-4 rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] p-4">
            <span>
              <span className="theme-heading block text-sm font-bold text-[#082758]">Tablas compactas</span>
              <span className="theme-muted mt-1 block text-xs leading-5 text-slate-500">Muestra mas filas cuando revisas productos y usuarios.</span>
            </span>
            <input
              name="compactTables"
              checked={preferences.compactTables}
              onChange={handlePreferenceChange}
              type="checkbox"
              className="h-5 w-5 accent-[#69b523]"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="rounded-2xl bg-[#082758] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#082758]/20 transition hover:-translate-y-0.5 hover:bg-[#0b3474]"
          >
            Guardar preferencias
          </button>
        </div>
      </section>

      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Seguridad</p>
            <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">Cambio de contrasena</h2>
            <p className="theme-muted mt-2 text-sm leading-6 text-slate-500">
              Actualiza tu acceso con una contrasena nueva de minimo 6 caracteres.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordMessage && (
              <p className={`rounded-2xl border px-4 py-3 text-sm font-bold ${passwordMessage.type === "success" ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
                {passwordMessage.text}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="theme-heading text-sm font-bold text-[#082758]">Actual</span>
                <input
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
                />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-bold text-[#082758]">Nueva</span>
                <input
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
                />
              </label>
              <label className="block">
                <span className="theme-heading text-sm font-bold text-[#082758]">Confirmar</span>
                <input
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  className="theme-input mt-2 w-full rounded-2xl border border-[#d8e8f7] bg-white px-4 py-3 text-sm font-semibold text-[#082758] outline-none transition focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-[#082758] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#082758]/20 transition hover:-translate-y-0.5 hover:bg-[#0b3474]"
              >
                Actualizar contrasena
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="theme-soft rounded-[24px] border border-[#d8e8f7] bg-white p-3">
              <img src={logo} alt="Data Stock" className="h-16 w-32 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f7fd3]">Apariencia</p>
              <h2 className="theme-heading mt-2 text-xl font-bold text-[#082758]">
                Modo {isDark ? "oscuro" : "claro"}
              </h2>
              <p className="theme-muted mt-2 text-sm leading-6 text-slate-500">
                Cambia los colores del sistema, login, registro y pantalla inicial usando la paleta del logo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl bg-[#69b523] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#69b523]/25 transition hover:-translate-y-0.5 hover:bg-[#5ca11d]"
          >
            Cambiar a modo {isDark ? "claro" : "oscuro"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Configuracion;
