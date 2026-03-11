import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../Services/api";

const LogoutButton = ({
  className = "",
  label = "Logout",
  redirectTo = "/login",
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await api.post("/auth/logout.php");
    } catch (err) {
      // backend failure shouldn't block client logout
    }

    Cookies.remove("token");
    Cookies.remove("role");

    navigate(redirectTo, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`logout-btn ${className}`}
      disabled={loading}
      aria-label={label}
      style={{ color: "black" }}
    >
      {label}
    </button>
  );
};

export default LogoutButton;
