import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import {
  Search,
  MapPin,
  Wrench,
  Zap,
  Stethoscope,
  Car,
  Paintbrush,
  Menu,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderRegister from "./pages/ProviderRegister";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";

import "./App.css";

// LIVE BACKEND API
const API_URL = "https://helpnearby-jgvg.onrender.com/api/providers";

const categories = [
  { name: "Electrician", icon: Zap, color: "orange" },
  { name: "Plumber", icon: Wrench, color: "blue" },
  { name: "Doctor", icon: Stethoscope, color: "green" },
  { name: "Mechanic", icon: Car, color: "purple" },
  { name: "Painter", icon: Paintbrush, color: "pink" },
];

function Home() {
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [providers, setProviders] = useState([]);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH PROVIDERS
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.providers)) {
          throw new Error("Invalid provider response");
        }

        setProviders(data.providers);
        setResults(data.providers);
        setError("");
      } catch (err) {
        console.error("Provider Fetch Error:", err);
        setError(
          "Unable to connect to server. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // SEARCH PROVIDERS
  const handleSearch = (selectedService = service) => {
    const searchService = selectedService.toLowerCase().trim();
    const searchLocation = location.toLowerCase().trim();

    const filteredProviders = providers.filter((provider) => {
      const providerService = provider.service?.toLowerCase() || "";
      const city = provider.city?.toLowerCase() || "";
      const state = provider.state?.toLowerCase() || "";
      const address = provider.address?.toLowerCase() || "";

      const serviceMatch =
        !searchService || providerService.includes(searchService);

      const locationMatch =
        !searchLocation ||
        city.includes(searchLocation) ||
        state.includes(searchLocation) ||
        address.includes(searchLocation);

      return serviceMatch && locationMatch;
    });

    setResults(filteredProviders);
    setSearched(true);
  };

  // CATEGORY CLICK
  const handleCategoryClick = (categoryName) => {
    setService(categoryName);
    handleSearch(categoryName);
  };

  // VIEW ALL PROVIDERS
  const handleViewAll = () => {
    setService("");
    setLocation("");
    setResults(providers);
    setSearched(false);
  };

  const displayedProviders = searched ? results : providers;

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">H</span>
          <span>HelpNearby</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="login-btn">
            Register
          </Link>

          <Link to="/customer-dashboard" className="login-btn">
            My Bookings
          </Link>

          <Link to="/provider-dashboard" className="login-btn">
            Provider Dashboard
          </Link>

          <Link to="/provider-register" className="provider-btn">
            <UserPlus size={17} />
            Become a Provider
          </Link>

          <Link to="/admin" className="login-btn">
            Admin
          </Link>
        </div>

        <Menu className="menu-icon" />
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">

          <span className="hero-tag">
            <ShieldCheck size={16} />
            Trusted Local Services
          </span>

          <h1>
            Find Trusted
            <br />
            <span>Services Near You</span>
          </h1>

          <p>
            Find electricians, plumbers, doctors, mechanics and other
            trusted service providers near your location.
          </p>

          <div className="search-box">

            <div className="search-input">
              <Wrench size={20} />

              <input
                type="text"
                placeholder="What service do you need?"
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </div>

            <div className="search-input">
              <MapPin size={20} />

              <input
                type="text"
                placeholder="Enter your city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              className="search-btn"
              onClick={() => handleSearch()}
            >
              <Search size={18} />
              Search
            </button>

          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services-section" id="services">

        <div className="section-heading">
          <span>OUR SERVICES</span>

          <h2>What Service Do You Need?</h2>

          <p>
            Choose a category to find nearby professionals.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                className="category-card"
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className={`category-icon ${category.color}`}>
                  <Icon size={28} />
                </div>

                <h3>{category.name}</h3>

                <ArrowRight size={18} />
              </button>
            );
          })}
        </div>

      </section>

      {/* PROVIDERS SECTION */}
      <section className="providers-section">

        <div className="section-heading">
          <span>NEARBY PROFESSIONALS</span>

          <h2>
            {searched
              ? "Search Results"
              : "Available Service Providers"}
          </h2>

          <p>
            Connect with service providers in your area.
          </p>

          {searched && (
            <button
              className="view-all-btn"
              onClick={handleViewAll}
            >
              View All Providers
            </button>
          )}
        </div>

        {loading ? (
          <p className="message">
            Loading providers...
          </p>
        ) : error ? (
          <p className="message error-message">
            {error}
          </p>
        ) : displayedProviders.length === 0 ? (
          <p className="message">
            No providers found. Try another service or location.
          </p>
        ) : (
          <div className="provider-grid">

            {displayedProviders.map((provider) => (
              <div className="provider-card" key={provider._id}>

                <div className="provider-icon">
                  <Wrench size={28} />
                </div>

                <h3>{provider.providerName}</h3>

                <p className="provider-service">
                  {provider.service}
                </p>

                <p>
                  <MapPin size={15} />
                  {provider.city}, {provider.state}
                </p>

                <p>{provider.address}</p>

                <Link
                  to={`/booking?providerId=${provider._id}`}
                  className="book-btn"
                >
                  Book Service
                  <ArrowRight size={16} />
                </Link>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* PROVIDER REGISTRATION */}
      <section className="provider-cta" id="about">

        <h2>Are You a Service Professional?</h2>

        <p>
          Join HelpNearby and connect with customers who need your services.
        </p>

        <Link
          to="/provider-register"
          className="provider-btn"
        >
          Register as Provider
          <ArrowRight size={18} />
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <h2>HelpNearby</h2>

        <p>
          Connecting people with trusted local service providers.
        </p>

        <p>
          © 2026 HelpNearby. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

// APP ROUTES
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/provider-register"
          element={<ProviderRegister />}
        />

        <Route path="/booking" element={<Booking />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="/customer-dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/provider-dashboard"
          element={<ProviderDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;