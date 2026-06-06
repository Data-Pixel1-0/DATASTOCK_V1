import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, background: "#f7f9ff" }}>
        <Navbar />

        <main style={{ padding: "24px 28px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;