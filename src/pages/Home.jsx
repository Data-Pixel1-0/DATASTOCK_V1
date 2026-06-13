import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.png";
import logo from "../assets/logo.png";

export default function Home() {
  const navigate = useNavigate();

  const highlights = [
    {
      value: "24/7",
      label: "Consulta disponible",
      detail: "Acceso centralizado para revisar productos cuando el equipo lo necesite.",
    },
    {
      value: "5 min",
      label: "Registro rapido",
      detail: "Agrega articulos, precios, stock y descripcion sin procesos largos.",
    },
    {
      value: "100%",
      label: "Visibilidad",
      detail: "Detecta inventario critico, agotado y recien agregado desde el panel.",
    },
  ];

  const modules = [
    {
      title: "Productos",
      description: "Administra referencias, precios, cantidades y descripciones desde una tabla clara.",
    },
    {
      title: "Reportes",
      description: "Consulta indicadores utiles para entender el estado del inventario y tomar decisiones.",
    },
    {
      title: "Usuarios",
      description: "Organiza el acceso del equipo para que cada persona trabaje desde una cuenta propia.",
    },
  ];

  const workflow = [
    "Registra productos con su informacion basica.",
    "Revisa alertas de stock bajo y articulos agotados.",
    "Consulta reportes para planear compras y reposicion.",
  ];

  return (
    <main className="theme-shell min-h-screen overflow-hidden text-[#082758]">
      <div className="relative">
        <div className="absolute inset-0" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="theme-card rounded-[28px] border border-[#d8e8f7] bg-white/95 px-5 py-3 shadow-xl shadow-[#082758]/8">
            <img src={logo} alt="Data Stock" className="h-16 w-auto object-contain sm:h-20" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-2xl bg-[#69b523] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-[#69b523]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#5ca11d]"
          >
            Iniciar sesion
          </button>
        </header>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8 home-fade-left">
              <div className="theme-card inline-flex items-center gap-3 rounded-full border border-[#bfe5a4] bg-white px-4 py-2 text-sm font-semibold text-[#2f7d1f] shadow-sm shadow-[#69b523]/10">
                <span className="h-2.5 w-2.5 rounded-full bg-[#69b523]" />
                Avanza con un gestor moderno de inventario
              </div>

              <div className="space-y-6">
                <h1 className="theme-heading max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-[#082758] md:text-6xl">
                  Tu inventario visible, organizado y bajo control.
                </h1>
                <p className="theme-muted max-w-2xl text-lg leading-8 text-slate-600">
                  Controla productos, stock bajo y reportes rapidos desde una interfaz profesional. Data Stock une la informacion importante en un panel claro para tomar mejores decisiones.
                </p>
              </div>
            </div>

            <div className="home-fade-up">
              <div className="theme-card overflow-hidden rounded-[36px] border border-[#d8e8f7] bg-white p-6 shadow-2xl shadow-[#082758]/10">
                <div className="rounded-[30px] bg-[linear-gradient(135deg,_#082758_0%,_#2f7fd3_68%,_#69b523_100%)] p-7 text-white shadow-xl shadow-[#082758]/15">
                  <p className="text-sm font-bold uppercase tracking-[0.26em] text-blue-100">Resumen rapido</p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="max-w-xs text-4xl font-bold leading-tight">Panel de inventario</h2>
                    <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur">
                      +20% eficiencia
                    </div>
                  </div>
                </div>

                <div className="theme-soft mt-5 rounded-[28px] border border-[#d8e8f7] bg-[#f8fbff] p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.26em] text-[#2f7fd3]">Interfaz elegante</p>
                  <p className="theme-muted mt-3 text-base leading-7 text-slate-600">
                    Una experiencia pensada para que tu equipo administre productos sin complicaciones y con una vista clara de lo mas importante.
                  </p>
                </div>

                <div className="mt-5 overflow-hidden rounded-[28px] border border-[#d8e8f7] bg-[#082758]">
                  <img src={hero} alt="Vista visual del sistema Data Stock" className="h-48 w-full object-cover opacity-95" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="informacion" className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.label} className="theme-card rounded-[28px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8">
                <p className="text-4xl font-bold text-[#2f7fd3]">{item.value}</p>
                <h2 className="theme-heading mt-4 text-lg font-bold text-[#082758]">{item.label}</h2>
                <p className="theme-muted mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="theme-card rounded-[32px] border border-[#d8e8f7] bg-white p-8 shadow-xl shadow-[#082758]/8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#69b523]">Para tu operacion</p>
              <h2 className="theme-heading mt-4 text-3xl font-bold text-[#082758]">Informacion clara antes de cada decision</h2>
              <p className="theme-muted mt-4 text-base leading-7 text-slate-600">
                Data Stock esta pensado para negocios que necesitan saber que tienen, que falta y que productos requieren atencion. La pantalla de inicio resume lo esencial para entrar al sistema con contexto.
              </p>

              <div className="mt-8 space-y-4">
                {workflow.map((step, index) => (
                  <div key={step} className="theme-soft flex gap-4 rounded-2xl border border-[#d8e8f7] bg-[#f8fbff] p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#69b523] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="theme-muted text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {modules.map((module) => (
                <article key={module.title} className="theme-card rounded-[28px] border border-[#d8e8f7] bg-white p-6 shadow-xl shadow-[#082758]/8 transition duration-300 hover:-translate-y-1">
                  <p className="text-sm font-bold uppercase tracking-[0.26em] text-[#2f7fd3]">Modulo</p>
                  <h3 className="theme-heading mt-3 text-2xl font-bold text-[#082758]">{module.title}</h3>
                  <p className="theme-muted mt-3 text-sm leading-6 text-slate-500">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
