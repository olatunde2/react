import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../components/ShiftManager/HomePage";
import Register from "../pages/Register";
import VerifyEmail from "../components/VerifyEmail";
import ForgetPassword from "../components/ForgetPassword";
import ResetPassword from "../components/ResetPassword";
import LogIn from "../pages/LogIn";
import CreateShift from "../components/ShiftManager/CreateShift";
import CreateClients from "../components/ClientsManager/CreateClients";
import ClientsManager from "../components/ClientsManager/ClientsManager";
import UserManagement from "../components/userManager";
import Logout from "../components/Logout";
import AdminRoute from "../components/AdminRoute";
import PromoteToAdmin from "../components/PromoteToAdmin";

const RoutesPage = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/log-out" element={<Logout />} />

        {/* Admin-Only Route */}
        <Route element={<AdminRoute />}>
          <Route path="/promote-to-admin" element={<PromoteToAdmin />} />
          <Route path="/create-shift" element={<CreateShift />} />
          <Route path="/clients-list" element={<ClientsManager />} />
          <Route path="/create" element={<CreateClients />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default RoutesPage;
