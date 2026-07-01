import { NavLink } from "react-router-dom";
import ThemeToggleButton from "./ThemeToggleButton.jsx";
import { useSessionUser } from "../hooks/useSessionUser.js";
import { canAccess } from "../utils/auth.js";

const mobileLinks = [
  { label: "Inicio", to: "/inicio", permission: "dashboard" },
  { label: "Productos", to: "/productos", permission: "productos" },
  { label: "Movimientos", to: "/movimientos", permission: "movimientos" },
  { label: "Reportes", to: "/reportes", permission: "reportes" },
];

function Navbar() {
  const user = useSessionUser();
  const visibleLinks = mobileLinks.filter((link) => canAccess(link.permission, user));

  return (
    <header className="theme-card sticky top-0 z-20 border-b border-[#d8e8f7] bg-white/80 px-5 py-4 shadow-sm shadow-[#082758]/5 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f7fd3]">Data Stock</p>
          <h2 className="theme-heading mt-1 text-2xl font-bold text-[#082758]">Panel Administrativo</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="theme-soft hidden rounded-full border border-[#d8e8f7] bg-white px-4 py-2 text-sm font-semibold text-[#082758] shadow-sm sm:block">
            {user?.rol ? `Rol: ${user.rol}` : "Inventario activo"}
          </div>
          <ThemeToggleButton />
          <div className="rounded-full bg-[#69b523] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#69b523]/25">
            En linea
          </div>
        </div>
      </div>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-4 py-2 text-sm font-semibold no-underline transition ${
                isActive ? "bg-[#082758] text-white" : "bg-[#eef6ff] text-[#082758]"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
