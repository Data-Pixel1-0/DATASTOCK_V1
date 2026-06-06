import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { loginUsuario, signupUsuario } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ nombre: "", usuario: "", password: "", email: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateFields = (data, requiredFields) => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === "") {
        nextErrors[field] = "Campo obligatorio";
      }
    });

    if (mode === "register") {
      if (data.email && !emailRegex.test(data.email)) {
        nextErrors.email = "Email inválido";
      }

      if (data.password && data.password.length < 6) {
        nextErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setMessage(null);
    if (!validateFields(loginData, ["email", "password"])) {
      return;
    }

    setLoading(true);
    try {
      await loginUsuario(loginData.email.trim(), loginData.password);
      navigate("/inicio");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setMessage(null);
    if (!validateFields(registerData, ["nombre", "usuario", "password", "email"])) {
      return;
    }

    setLoading(true);
    try {
      const response = await signupUsuario(
        registerData.nombre.trim(),
        registerData.usuario.trim(),
        registerData.password,
        registerData.email.trim()
      );

      setMessage({ type: "success", text: response.message || "Registro exitoso" });
      setRegisterData({ nombre: "", usuario: "", password: "", email: "" });
      setMode("login");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, formType) => {
    const { name, value } = event.target;
    if (formType === "login") {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="relative lg:w-1/2 flex-1 overflow-hidden bg-gradient-to-br from-sky-800 via-slate-950 to-slate-900 px-8 py-14 text-white login-fade-left">
          <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-16 right-20 h-52 w-52 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative z-10 mx-auto flex h-full max-w-xl flex-col justify-center gap-8">
            <img src={logo} alt="Data Stock" className="h-16 w-auto max-w-[220px] object-contain rounded-2xl border border-white/20 bg-white/10 p-2 shadow-lg shadow-slate-950/20" />

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Bienvenido a tu panel</p>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
                Control total de inventario con estilo
              </h1>
              <p className="max-w-xl text-base text-slate-200/90">
                Inicia sesión para llevar el control de productos, alertas de stock y reportes clave en una interfaz limpia, rápida y moderna.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-100/80">Fácil acceso</p>
                <p className="mt-3 text-lg font-semibold">Accede rápido con tu usuario y contraseña.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-100/80">Sistema seguro</p>
                <p className="mt-3 text-lg font-semibold">Tus datos y productos protegidos siempre.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 lg:px-12">
          <div className="relative w-full max-w-lg login-fade-up">
            <div className="absolute -left-8 top-14 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-8 bottom-12 h-20 w-20 rounded-full bg-slate-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/95 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Acceso</p>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode((prev) => (prev === "login" ? "register" : "login"));
                    setErrors({});
                    setMessage(null);
                  }}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
                >
                  {mode === "login" ? "Registrarme" : "Login"}
                </button>
              </div>

              {message && (
                <div
                  className={`mb-6 rounded-3xl px-4 py-3 ${
                    message.type === "success"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form className="space-y-5">
                {mode === "register" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                    <input
                      name="nombre"
                      value={registerData.nombre}
                      onChange={(event) => handleInputChange(event, "register")}
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      className={`w-full rounded-3xl border px-4 py-3 text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
                        errors.nombre ? "border-rose-500" : "border-slate-200"
                      }`}
                    />
                    {errors.nombre && <p className="text-sm text-rose-500">{errors.nombre}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{mode === "login" ? "Correo" : "Usuario"}</label>
                  <input
                    name={mode === "login" ? "email" : "usuario"}
                    value={mode === "login" ? loginData.email : registerData.usuario}
                    onChange={(event) => handleInputChange(event, mode)}
                    type={mode === "login" ? "email" : "text"}
                    placeholder={mode === "login" ? "tu@correo.com" : "Tu usuario"}
                    className={`w-full rounded-3xl border px-4 py-3 text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
                      errors[mode === "login" ? "email" : "usuario"] ? "border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors[mode === "login" ? "email" : "usuario"] && <p className="text-sm text-rose-500">{errors[mode === "login" ? "email" : "usuario"]}</p>}
                </div>

                {mode === "register" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      name="email"
                      value={registerData.email}
                      onChange={(event) => handleInputChange(event, "register")}
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className={`w-full rounded-3xl border px-4 py-3 text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
                        errors.email ? "border-rose-500" : "border-slate-200"
                      }`}
                    />
                    {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contraseña</label>
                  <input
                    name="password"
                    value={mode === "login" ? loginData.password : registerData.password}
                    onChange={(event) => handleInputChange(event, mode)}
                    type="password"
                    placeholder="********"
                    className={`w-full rounded-3xl border px-4 py-3 text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
                      errors.password ? "border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
                </div>

                <button
                  type="button"
                  onClick={mode === "login" ? handleLogin : handleRegister}
                  disabled={loading}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-base font-semibold text-white shadow-xl shadow-slate-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading
                    ? mode === "login"
                      ? "Validando..."
                      : "Registrando..."
                    : mode === "login"
                    ? "Ingresar"
                    : "Crear cuenta"}
                </button>
              </form>

              <div className="mt-8 rounded-3xl bg-slate-100/80 p-4 text-sm text-slate-700 shadow-inner shadow-slate-950/10">
                <p className="font-medium">Consejo rápido</p>
                <p className="mt-2 text-slate-600">
                  Usa el botón superior para cambiar entre iniciar sesión y crear cuenta. El diseño está pensado para verse bien con tus estilos actuales.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
