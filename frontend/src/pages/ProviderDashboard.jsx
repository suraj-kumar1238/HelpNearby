import { useEffect, useState } from "react";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      alert("Booking status updated!");
      setLoading(true);
      await fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <h2>Loading Admin Dashboard...</h2>;
  if (error) return <h2>{error}</h2>;

  const pending = bookings.filter(b => b.status === "Pending").length;
  const accepted = bookings.filter(b => b.status === "Accepted").length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const rejected = bookings.filter(b => b.status === "Rejected").length;

  return (
    <div style={{ padding: "30px" }}>
      <h1>HelpNearby Admin Dashboard</h1>
      <p>Manage all service bookings here.</p>

      <h3>Total: {bookings.length}</h3>
      <h3>Pending: {pending}</h3>
      <h3>Accepted: {accepted}</h3>
      <h3>Completed: {completed}</h3>
      <h3>Rejected: {rejected}</h3>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id}>
                  <td>{booking.customerName}</td>
                  <td>{booking.service}</td>
                  <td>{booking.provider?.providerName || "Not assigned"}</td>
                  <td>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{booking.address}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === "Pending" && (
                      <>
                        <button onClick={() => updateStatus(booking._id, "Accepted")}>
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(booking._id, "Rejected")}
                          style={{ marginLeft: "5px" }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {booking.status === "Accepted" && (
                      <button onClick={() => updateStatus(booking._id, "Completed")}>
                        Complete
                      </button>
                    )}

                    {(booking.status === "Completed" ||
                      booking.status === "Rejected") && <span>No Action</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;