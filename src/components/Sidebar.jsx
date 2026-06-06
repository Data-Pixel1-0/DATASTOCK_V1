import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Inicio", to: "/inicio" },
  { label: "Productos", to: "/productos" },
  { label: "Usuarios", to: "/usuarios" },
  { label: "Reportes", to: "/reportes" },
  { label: "Configuración", to: "/configuracion" },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "250px",
        background: "#0f1f5c",
        color: "white",
        padding: "24px 20px",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", letterSpacing: "0.04em" }}>
          DATA STOCK
        </h2>
        <p style={{ color: "#9bb5ed", marginTop: 8, fontSize: "0.95rem" }}>
          Panel Administrativo
        </p>
      </div>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "block",
              color: isActive ? "#ffffff" : "#dce6ff",
              background: isActive ? "#172f6f" : "transparent",
              padding: "12px 14px",
              borderRadius: 12,
              marginBottom: 8,
              textDecoration: "none",
              fontWeight: isActive ? 700 : 500,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;