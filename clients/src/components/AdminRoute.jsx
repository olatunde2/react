import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const userRole = localStorage.getItem("userRole"); // Get the user role

  return userRole === "admin" ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
