import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const menuItems = [
  { label: "Inicio", to: "/inicio" },
  { label: "Productos", to: "/productos" },
  { label: "Usuarios", to: "/usuarios" },
  { label: "Reportes", to: "/reportes" },
  { label: "Configuracion", to: "/configuracion" },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-hidden bg-[#082758] px-5 py-6 text-white shadow-2xl shadow-[#082758]/25 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(47,127,211,0.42),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(105,181,35,0.35),_transparent_30%)]" />

      <div className="relative mb-8 rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-xl shadow-[#03152f]/20">
        <img src={logo} alt="Data Stock" className="h-20 w-full object-contain" />
      </div>

      <div className="relative mb-7">
        <h2 className="text-xl font-bold tracking-[0.08em]">DATA STOCK</h2>
        <p className="mt-2 text-sm text-blue-100">Panel Administrativo</p>
      </div>

      <nav className="relative space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold no-underline transition duration-300 ${
                isActive
                  ? "bg-white text-[#082758] shadow-lg shadow-[#03152f]/20"
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span>{item.label}</span>
            <span className="h-2 w-2 rounded-full bg-[#69b523] opacity-0 transition group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      <div className="relative mt-8 rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-blue-50">
        <p className="font-semibold text-white">Tu inventario, bajo control.</p>
        <p className="mt-2 leading-6 text-blue-100">Gestiona stock, productos y reportes desde un solo panel.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
