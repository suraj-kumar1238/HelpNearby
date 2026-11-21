import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

const initialFormData = {
  customerName: "",
  mobile: "",
  service: "",
  bookingDate: "",
  address: "",
  description: "",
  provider: "",
};

function Booking() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch(`${API_URL}/providers`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load providers.");
        }

        setProviders(data.providers || []);
      } catch (error) {
        setMessage(error.message || "Unable to load providers.");
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "provider") {
      const selectedProvider = providers.find(
        (item) => item._id === value
      );

      setFormData((previous) => ({
        ...previous,
        provider: value,
        service: selectedProvider?.service || "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
      setMessage("Please login as Customer before booking.");
      return;
    }

    if (user?.role !== "customer") {
      setMessage("Only customers can book a service.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage("Booking created successfully!");
      setFormData(initialFormData);
    } catch (error) {
      setMessage(error.message || "Server connection failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Book a Service</h1>
      <p>Choose a professional and book your service.</p>

      {message && (
        <p style={styles.message}>{message}</p>
      )}

      {loading ? (
        <p>Loading providers...</p>
      ) : providers.length === 0 ? (
        <p>No providers available right now.</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="customerName"
            placeholder="Your Name"
            value={formData.customerName}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="mobile"
            placeholder="10 Digit Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />

          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            required
          >
            <option value="">Select Service Provider</option>

            {providers.map((item) => (
              <option key={item._id} value={item._id}>
                {item.providerName} - {item.service} ({item.city})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Selected Service"
            value={formData.service}
            readOnly
          />

          <input
            type="datetime-local"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Your Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Describe your problem (optional)"
            value={formData.description}
            onChange={handleChange}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => navigate("/")}
        style={styles.backButton}
      >
        Back to Home
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "25px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  message: {
    padding: "10px",
    background: "#f1f5f9",
    borderRadius: "6px",
  },

  backButton: {
    marginTop: "15px",
    padding: "10px 15px",
    cursor: "pointer",
  },
};

export default Booking;