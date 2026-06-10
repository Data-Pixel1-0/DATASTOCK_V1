import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { loginUsuario, signupUsuario } from "../services/api.js";
import { saveCurrentUser } from "../utils/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ nombre: "", usuario: "", password: "", email: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isLogin = mode === "login";

  const validateFields = (data, requiredFields) => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === "") {
        nextErrors[field] = "Campo obligatorio";
      }
    });

    if (mode === "register") {
      if (data.email && !emailRegex.test(data.email)) {
        nextErrors.email = "Email invalido";
      }

      if (data.password && data.password.length < 6) {
        nextErrors.password = "La contrasena debe tener al menos 6 caracteres";
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
      const response = await loginUsuario(loginData.email.trim(), loginData.password);
      if (response?.user) {
        saveCurrentUser(response.user);
      }
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

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrors({});
    setMessage(null);
  };

  const inputClass = (hasError) =>
    `w-full rounded-2xl border px-4 py-3 text-[#082758] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#2f7fd3] focus:ring-4 focus:ring-[#2f7fd3]/10 ${
      hasError ? "border-rose-400 bg-rose-50" : "border-[#d8e8f7] bg-white"
    }`;

  return (
    <main className="theme-shell min-h-screen overflow-hidden text-[#082758]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0" />

        <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-between px-6 py-8 lg:px-12">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="theme-card rounded-2xl border border-[#d8e8f7] bg-white px-4 py-2 text-sm font-bold text-[#082758] shadow-sm transition hover:bg-[#f8fbff]"
              >
                Inicio
              </button>
            </div>

            <div className="mx-auto flex w-full max-w-xl flex-col gap-8 py-10 login-fade-left">
              <div className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white/95 p-5 shadow-2xl shadow-[#082758]/10">
                <img src={logo} alt="Data Stock" className="h-28 w-full object-contain sm:h-32" />
              </div>

              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#69b523]">
                  {isLogin ? "Bienvenido de nuevo" : "Crea tu acceso"}
                </p>
                <h1 className="theme-heading text-5xl font-bold leading-tight tracking-tight text-[#082758]">
                  {isLogin ? "Entra a tu panel de inventario." : "Empieza a controlar tu inventario."}
                </h1>
                <p className="theme-muted max-w-xl text-base leading-7 text-slate-600">
                  Gestiona productos, existencias, usuarios y reportes desde una experiencia visual alineada con Data Stock.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="theme-card rounded-[28px] border border-[#d8e8f7] bg-white p-5 shadow-xl shadow-[#082758]/8">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#2f7fd3]">Acceso rapido</p>
                  <p className="theme-muted mt-3 text-sm leading-6 text-slate-600">Ingresa con tus credenciales y continua tu operacion.</p>
                </div>
                <div className="theme-card rounded-[28px] border border-[#bfe5a4] bg-[#f1f9eb] p-5 shadow-xl shadow-[#69b523]/10">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#2f7d1f]">Datos claros</p>
                  <p className="theme-muted mt-3 text-sm leading-6 text-slate-600">Manten productos, stock y reportes en un solo lugar.</p>
                </div>
              </div>
            </div>

            <p className="theme-muted text-sm text-slate-500">Tu inventario, bajo control.</p>
          </section>

          <section className="flex items-center justify-center px-6 py-10 lg:px-12">
            <div className="w-full max-w-lg login-fade-up">
              <div className="theme-card overflow-hidden rounded-[36px] border border-[#d8e8f7] bg-white p-8 shadow-2xl shadow-[#082758]/12">
                <div className="mb-7 rounded-[28px] bg-[linear-gradient(135deg,_#082758_0%,_#2f7fd3_68%,_#69b523_100%)] p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-100">Acceso</p>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-3xl font-bold">{isLogin ? "Iniciar sesion" : "Crear cuenta"}</h2>
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="theme-card rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#082758] shadow-lg shadow-[#082758]/10 transition hover:bg-[#eef6ff]"
                    >
                      {isLogin ? "Registrarme" : "Ya tengo cuenta"}
                    </button>
                  </div>
                </div>

                {message && (
                  <div
                    className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      message.type === "success"
                        ? "border-[#bfe5a4] bg-[#f1f9eb] text-[#2f7d1f]"
                        : "border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="theme-heading text-sm font-bold text-[#082758]">Nombre completo</label>
                      <input
                        name="nombre"
                        value={registerData.nombre}
                        onChange={(event) => handleInputChange(event, "register")}
                        type="text"
                        placeholder="Ej. Juan Perez"
                        className={`${inputClass(errors.nombre)} theme-input`}
                      />
                      {errors.nombre && <p className="text-sm text-rose-500">{errors.nombre}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="theme-heading text-sm font-bold text-[#082758]">{isLogin ? "Correo" : "Usuario"}</label>
                    <input
                      name={isLogin ? "email" : "usuario"}
                      value={isLogin ? loginData.email : registerData.usuario}
                      onChange={(event) => handleInputChange(event, mode)}
                      type={isLogin ? "email" : "text"}
                      placeholder={isLogin ? "tu@correo.com" : "Tu usuario"}
                      className={`${inputClass(errors[isLogin ? "email" : "usuario"])} theme-input`}
                    />
                    {errors[isLogin ? "email" : "usuario"] && (
                      <p className="text-sm text-rose-500">{errors[isLogin ? "email" : "usuario"]}</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="theme-heading text-sm font-bold text-[#082758]">Email</label>
                      <input
                        name="email"
                        value={registerData.email}
                        onChange={(event) => handleInputChange(event, "register")}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className={`${inputClass(errors.email)} theme-input`}
                      />
                      {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="theme-heading text-sm font-bold text-[#082758]">Contrasena</label>
                    <input
                      name="password"
                      value={isLogin ? loginData.password : registerData.password}
                      onChange={(event) => handleInputChange(event, mode)}
                      type="password"
                      placeholder="********"
                      className={`${inputClass(errors.password)} theme-input`}
                    />
                    {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={isLogin ? handleLogin : handleRegister}
                    disabled={loading}
                    className="w-full rounded-2xl bg-[#69b523] px-5 py-3 text-base font-bold text-white shadow-xl shadow-[#69b523]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#5ca11d] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading
                      ? isLogin
                        ? "Validando..."
                        : "Registrando..."
                      : isLogin
                      ? "Ingresar"
                      : "Crear cuenta"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
