import { useEffect, useState } from "react";

function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login first.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/bookings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        const bookingList = Array.isArray(data.bookings)
          ? data.bookings
          : [];

        setBookings(bookingList);

      } catch (err) {
        console.error("Booking Error:", err);
        setError(err.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, []);

  if (loading) {
    return <h2>Loading bookings...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Bookings</h1>

      <p>Track all your service bookings here.</p>

      <h3>Total Bookings: {bookings.length}</h3>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="12"
            cellSpacing="0"
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >
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
                      ? new Date(
                          booking.bookingDate
                        ).toLocaleDateString()
                      : "Not available"}
                  </td>

                  <td>{booking.address}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;