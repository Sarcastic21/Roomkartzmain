import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const role = localStorage.getItem("role");
  const isLoggedIn = !!role;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) return;
  
    try {
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        localStorage.clear();
        navigate("/login");
        setIsMenuOpen(false);
      } else {
        const error = await response.json();
        console.error("Logout failed:", error.message);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };
  

  const navLinks = [
    ...(isLoggedIn && role !== "User"
      ? [{ path: "/owner", label: "Dashboard" }]
      : []),
    { path: "/properties", label: "Properties" },
    isLoggedIn
      ? { path: null, label: "Logout", action: handleLogout }
      : { path: "/login", label: "Login" },
  ];

  return (
    <nav
      className={`fixed w-full   z-50 bg-[#2D3A45] ${
        isScrolled ? "shadow-lg" : ""
      } transition-shadow duration-300 ease-in-out`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              Room<span className="text-[#FFD700]">Rental</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative">
                {link.path ? (
                  <Link
                    to={link.path}
                    className={`text-white text-lg font-medium ${
                      location.pathname === link.path ? "text-[#FFD700]" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    onClick={link.action}
                    className="text-white text-lg font-medium"
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#FFD700] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        style={{ height: isMenuOpen ? 'auto' : 0 }}
        className={`md:hidden overflow-hidden transition-height duration-300`}
      >
        <div className="px-2 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="px-3 py-2 rounded-md hover:bg-gray-800"
            >
              {link.path ? (
                <Link
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-white text-lg ${
                    location.pathname === link.path ? "text-[#FFD700]" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setIsMenuOpen(false);
                  }}
                  className="block text-white text-lg w-full text-left"
                >
                  {link.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;