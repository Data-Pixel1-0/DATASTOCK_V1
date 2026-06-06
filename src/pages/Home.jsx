import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_28%)]" />
        <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 p-2 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              <img src={logo} alt="Data Stock" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Data Stock</p>
              <p className="text-xs text-slate-300">Gestor de inventario</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Iniciar sesión
          </button>
        </header>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-16 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="space-y-8 home-fade-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 shadow-sm shadow-emerald-500/10">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Avanza con un gestor moderno de inventario
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-50 md:text-6xl">
                  Tu inventario siempre visible, organizado y listo para crecer.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Controla productos, stock bajo y reportes rápidos desde una interfaz profesional y amigable.
                  El gestor te ayuda a tomar decisiones claras con información en tiempo real.
                </p>
              </div>
            </div>

            <div className="home-fade-up">
              <div className="overflow-hidden rounded-[40px] border border-emerald-500/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-emerald-950/20 p-6 shadow-inner shadow-emerald-950/10">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Resumen rápido</p>
                    <h2 className="mt-3 text-3xl font-bold text-white">Panel de inventario</h2>
                  </div>
                  <div className="rounded-3xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100">
                    +20% eficiencia
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/85 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900/95">
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Productos</p>
                    <p className="mt-4 text-3xl font-bold text-white">345</p>
                    <p className="mt-2 text-sm text-slate-400">Inventario completo y actualizado.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/85 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900/95">
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Stock bajo</p>
                    <p className="mt-4 text-3xl font-bold text-emerald-400">12</p>
                    <p className="mt-2 text-sm text-slate-400">Alertas inmediatas para reabastecer.</p>
                  </div>
                </div>

                <div className="mt-8 rounded-[32px] border border-emerald-500/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">Interfaz elegante</p>
                  <p className="mt-3 text-base leading-7 text-slate-300">
                    Una experiencia pensada para que tu equipo administre productos sin complicaciones y con una vista clara de lo más importante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
