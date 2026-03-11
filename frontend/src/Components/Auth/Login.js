import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthenticateProvider";
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { logIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost/trust_site/auth/login.php",
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res?.data?.success) {
        const { token, role } = res.data.data;

        logIn(token, role);

        toast.success("Login successful ✅");

        setTimeout(() => {
          // ✅ Admin should always go to dashboard
          if (role === "admin") {
            navigate("/dashboard", { replace: true });
            return;
          }

          // ✅ Others can use "from"
          if (from) {
            navigate(from, { replace: true });
            return;
          }

          if (role === "donor") navigate("/donate", { replace: true });
          else if (role === "user") navigate("/request", { replace: true });
          else navigate("/", { replace: true });
        }, 300);

      } else {
        toast.error(res?.data?.message || "Login failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your support</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="auth-group">
            <label>Password</label>

            {/* ✅ SAME STYLE AS REGISTER */}
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            className={`auth-btn ${loading ? "loading" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don’t have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
