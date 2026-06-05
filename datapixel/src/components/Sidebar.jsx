import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      style={{
        width: "250px",
        background: "#0f1f5c",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>DATA STOCK</h2>

      <hr />

      <nav>
        <p>
          <Link to="/dashboard">Dashboard</Link>
        </p>

        <p>
          <Link to="/productos">Productos</Link>
        </p>

        <p>
          <Link to="/usuarios">Usuarios</Link>
        </p>

        <p>
          <Link to="/reportes">Reportes</Link>
        </p>
      </nav>
    </aside>
  );
}

export default Sidebar;