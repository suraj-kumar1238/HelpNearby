import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!token) {
          throw new Error("Please login first.");
        }

        if (user?.role !== "customer") {
          throw new Error("Please login with a Customer account.");
        }

        const response = await fetch(`${API_URL}/bookings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings.");
        }

        setBookings(
          Array.isArray(data.bookings) ? data.bookings : []
        );
      } catch (err) {
        setError(err.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, []);

  if (loading) {
    return <h2 style={{ padding: "30px" }}>Loading bookings...</h2>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>{error}</h2>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>My Bookings</h1>
      <p>Track all your service bookings here.</p>

      <div style={styles.summary}>
        <h3>Total Bookings: {bookings.length}</h3>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <h3>No bookings found.</h3>
          <p>Book a service to see your bookings here.</p>
          <Link to="/booking">Book a Service</Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.customerName}</td>
                  <td>{booking.service}</td>
                  <td>
                    {booking.provider?.providerName || "Not assigned"}
                  </td>
                  <td>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleString()
                      : "Not available"}
                  </td>
                  <td>{booking.address}</td>
                  <td>
                    <span style={styles.status}>
                      {booking.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/" style={styles.backLink}>
        Back to Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "auto",
  },

  summary: {
    background: "#f1f5f9",
    padding: "15px",
    margin: "20px 0",
    borderRadius: "10px",
  },

  empty: {
    padding: "30px",
    textAlign: "center",
    background: "#f8fafc",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  status: {
    padding: "6px 12px",
    background: "#dcfce7",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  backLink: {
    display: "inline-block",
    marginTop: "25px",
  },
};

export default CustomerDashboard;