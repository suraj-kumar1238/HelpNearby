import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("customer");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const form = e.target;

    const userData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      mobile: form.mobile.value.trim(),
      password: form.password.value,
      role,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully!");

      form.reset();
      setRole("customer");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Create Account</h1>
        <p>Join HelpNearby today</p>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          required
        />

        <label>Mobile Number</label>
        <input
          type="tel"
          name="mobile"
          pattern="[0-9]{10}"
          maxLength={10}
          placeholder="10 digit mobile number"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          minLength={8}
          placeholder="Create password"
          required
        />

        <label>Register As</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>

        <Link to="/">Back to Home</Link>
      </form>
    </div>
  );
}

export default Register;