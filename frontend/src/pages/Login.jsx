import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;

    const loginData = {
      email: form.email.value.trim(),
      password: form.password.value,
      role: form.role.value,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login Successful!");

      if (data.user.role === "provider") {
        navigate("/provider-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (err) {
      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>Welcome Back!</h1>
        <p>Login to your HelpNearby account</p>

        {error && (
          <p style={{ color: "red", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          required
        />

        <label>Login As</label>
        <select name="role" required>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

        <Link to="/">Back to Home</Link>
      </form>
    </div>
  );
}

export default Login;