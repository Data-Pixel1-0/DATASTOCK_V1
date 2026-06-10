const reportCards = [
  {
    title: "Inventario general",
    detail: "Consulta productos registrados, valor total y movimientos principales.",
    color: "from-[#2f7fd3] to-[#082758]",
  },
  {
    title: "Reposicion",
    detail: "Identifica articulos con stock bajo para planear compras a tiempo.",
    color: "from-[#69b523] to-[#2f7d1f]",
  },
  {
    title: "Actividad reciente",
    detail: "Revisa los ultimos cambios y productos agregados al sistema.",
    color: "from-[#082758] to-[#184f9c]",
  },
];

function Reportes() {
  return (
    <div className="space-y-7">
      <section className="rounded-[32px] border border-[#d8e8f7] bg-white p-7 shadow-xl shadow-[#082758]/8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#69b523]">Analisis</p>
        <h1 className="mt-2 text-3xl font-bold text-[#082758]">Reportes</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Visualiza informacion clave para tomar decisiones sobre inventario, reposicion y actividad del sistema.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {reportCards.map((card) => (
          <article key={card.title} className="overflow-hidden rounded-[32px] border border-[#d8e8f7] bg-white shadow-xl shadow-[#082758]/8 transition duration-300 hover:-translate-y-1">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#082758]">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{card.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Reportes;
