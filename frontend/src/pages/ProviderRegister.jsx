import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

const initialFormData = {
  providerName: "",
  email: "",
  mobile: "",
  service: "",
  state: "",
  city: "",
  address: "",
};

function ProviderRegister() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
      setError("Please login with your Provider account first.");
      return;
    }

    if (user?.role !== "provider") {
      setError("Please login with a Provider account first.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/providers/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data.message || "Provider registered successfully!"
      );

      setFormData(initialFormData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Become a Provider</h1>
        <p>Register your professional service</p>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <label>Provider Name</label>
        <input
          type="text"
          name="providerName"
          value={formData.providerName}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label>Mobile Number</label>
        <input
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="10 digit mobile number"
          pattern="[0-9]{10}"
          maxLength={10}
          required
        />

        <label>Service</label>
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
        >
          <option value="">Select Service</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Doctor">Doctor</option>
          <option value="Mechanic">Mechanic</option>
          <option value="Painter">Painter</option>
          <option value="Other">Other</option>
        </select>

        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="Enter your state"
          required
        />

        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter your city"
          required
        />

        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your full address"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register as Provider"}
        </button>

        <Link to="/">Back to Home</Link>
      </form>
    </div>
  );
}

export default ProviderRegister;