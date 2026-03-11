import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../Assets/css/global.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
