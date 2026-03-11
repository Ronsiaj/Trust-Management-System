import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminSidebar = ({ closeMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // clear cookies if any (optional)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    toast.success("Logged out successfully");

    setTimeout(() => {
      navigate("/login", { replace: true });
      window.location.reload(); // ✅ important
    }, 800);
  };



  return (
    <div className="admin-sidebar">
      {/* LOGO */}
      <div className="admin-sidebar-logo">
        <img
          src={require("../Assets/images/logo.png")}
          alt="Logo"
          className="sidebar-logo-img"
        />
      </div>

      {/* MENU */}
      <ul className="admin-sidebar-menu">
        <li>
          <NavLink to="/dashboard" onClick={closeMenu}>
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/review" onClick={closeMenu}>
            Review Requests
          </NavLink>
        </li>

        <li>
          <NavLink to="/payment-list" onClick={closeMenu}>
            Payments
          </NavLink>
        </li>

        <li>
          <NavLink to="/userlist" onClick={closeMenu}>
            Users
          </NavLink>
        </li>

        <li>
          <NavLink to="/email-status" onClick={closeMenu}>
            Email Status
          </NavLink>
        </li>
      </ul>

      {/* LOGOUT */}
      <div className="admin-sidebar-logout">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
