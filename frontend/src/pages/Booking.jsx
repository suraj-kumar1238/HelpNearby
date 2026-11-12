import { useEffect, useState } from "react";

function Booking() {
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    mobile: "",
    service: "",
    bookingDate: "",
    address: "",
    description: "",
    provider: ""
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data.providers || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Unable to load providers.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "provider") {
      const selectedProvider = providers.find(
        (item) => item._id === value
      );

      setFormData({
        ...formData,
        provider: value,
        service: selectedProvider ? selectedProvider.service : ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login as Customer before booking.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage("Booking created successfully!");

      setFormData({
        customerName: "",
        mobile: "",
        service: "",
        bookingDate: "",
        address: "",
        description: "",
        provider: ""
      });

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

      {message && <p>{message}</p>}

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
            min={new Date().toISOString().slice(0, 16)}
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
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  }
};

export default Booking;