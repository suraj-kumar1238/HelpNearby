import React, { useEffect, useState } from "react";

const API_URL = "https://helpnearby-jgvg.onrender.com/api";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as Admin first.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings");
      }

      setBookings(data.bookings || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      await fetchBookings();
      alert(`Booking ${status} successfully!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = bookings.filter(b => b.status === "Pending").length;
  const accepted = bookings.filter(b => b.status === "Accepted").length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const rejected = bookings.filter(b => b.status === "Rejected").length;

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>HelpNearby Admin Dashboard</h1>
      <p>Manage all service bookings here.</p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <h3>Total: {bookings.length}</h3>
        <h3>Pending: {pending}</h3>
        <h3>Accepted: {accepted}</h3>
        <h3>Completed: {completed}</h3>
        <h3>Rejected: {rejected}</h3>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="12" cellSpacing="0" width="100%">
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
                  <td>{booking.provider?.providerName || "N/A"}</td>
                  <td>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td>{booking.address}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === "Pending" && (
                      <>
                        <button
                          disabled={updatingId === booking._id}
                          onClick={() => updateStatus(booking._id, "Accepted")}
                        >
                          Accept
                        </button>

                        <button
                          disabled={updatingId === booking._id}
                          onClick={() => updateStatus(booking._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {booking.status === "Accepted" && (
                      <button
                        disabled={updatingId === booking._id}
                        onClick={() => updateStatus(booking._id, "Completed")}
                      >
                        Complete
                      </button>
                    )}

                    {["Completed", "Rejected"].includes(booking.status) && (
                      <span>No actions</span>
                    )}
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