import { Navigate, Outlet } from "react-router-dom";
import { canAccess, getCurrentUser } from "../utils/auth.js";

function ProtectedRoute({ permission }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (permission && !canAccess(permission, user)) {
    return <Navigate replace to="/inicio" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
