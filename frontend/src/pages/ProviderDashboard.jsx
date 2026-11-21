import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://helpnearby-jgvg.onrender.com/api";

function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!token) {
          throw new Error("Please login first.");
        }

        if (user?.role !== "provider") {
          throw new Error("Please login with a Provider account.");
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

        const bookingList = Array.isArray(data.bookings)
          ? data.bookings
          : [];

        setBookings(bookingList);
      } catch (err) {
        setError(err.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <h2 style={{ padding: "30px" }}>Loading Provider Dashboard...</h2>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>{error}</h2>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  const pending = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const accepted = bookings.filter(
    (booking) => booking.status === "Accepted"
  ).length;

  const completed = bookings.filter(
    (booking) => booking.status === "Completed"
  ).length;

  const rejected = bookings.filter(
    (booking) => booking.status === "Rejected"
  ).length;

  return (
    <div style={styles.container}>
      <h1>Provider Dashboard</h1>
      <p>Welcome to your HelpNearby Provider Dashboard.</p>

      <div style={styles.stats}>
        <div style={styles.card}>Total Bookings: {bookings.length}</div>
        <div style={styles.card}>Pending: {pending}</div>
        <div style={styles.card}>Accepted: {accepted}</div>
        <div style={styles.card}>Completed: {completed}</div>
        <div style={styles.card}>Rejected: {rejected}</div>
      </div>

      <h2>Customer Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Service</th>
                <th>Date</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.customerName}</td>
                  <td>{booking.mobile}</td>
                  <td>{booking.service}</td>
                  <td>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{booking.address}</td>
                  <td>{booking.status || "Pending"}</td>
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

  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    margin: "25px 0",
  },

  card: {
    background: "#f1f5f9",
    padding: "18px",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  backLink: {
    display: "inline-block",
    marginTop: "25px",
  },
};

export default ProviderDashboard;