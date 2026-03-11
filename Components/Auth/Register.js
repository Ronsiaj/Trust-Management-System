import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Services/api";
import { toast } from "react-toastify";


const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔴 Frontend validation
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter valid 10-digit phone number");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post(
        "http://localhost/trust_site/auth/register.php",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }
      );

       toast.success("Registration successful");

      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label>Name</label>
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label>Phone</label>
            <input
              name="phone"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label>Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <div className="auth-group">
            <label>Confirm Password</label>

            <div className="auth-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>


          <button className="auth-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
