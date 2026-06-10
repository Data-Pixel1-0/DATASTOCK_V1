import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Productos from "../pages/Productos.jsx";
import Movimientos from "../pages/Movimientos.jsx";
import Usuarios from "../pages/Usuarios.jsx";
import Reportes from "../pages/Reportes.jsx";
import Configuracion from "../pages/Configuracion.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/inicio" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate replace to="/inicio" />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route element={<ProtectedRoute permission="usuarios" />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
