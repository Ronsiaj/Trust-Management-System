import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import Logo from "../Assets/images/logo.png";
import { useAuth } from "../Context/AuthenticateProvider";


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { isAuthenticated, role, logOut } = useAuth();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container">
        <nav className="navbar">
          {/* LOGO */}
          <Link className="navbar-brand" to="/" onClick={closeMenu}>
            <img
              src={Logo}
              alt="Helping Hands Trust"
              className="site-logo"
            />
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

          {/* NAV MENU */}
          <div ref={menuRef} className={`nav-menu ${menuOpen ? "show" : ""}`}>
            <ul className="nav-list">
              {/* PUBLIC LINKS (Hide for Admin) */}
              {role !== "admin" && (
                <>
                  <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
                  <li><NavLink to="/about" onClick={closeMenu}>About Us</NavLink></li>
                  <li><NavLink to="/publicview" onClick={closeMenu}>Requests</NavLink></li>
                  <li><NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink></li>
                  <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
                  <li><NavLink to="/donators" onClick={closeMenu}>Donators</NavLink></li>

                  {/* Raise Fund only for PUBLIC (not logged in) */}
                  {!isAuthenticated && role !== "admin" && (
                    <li>
                      <NavLink to="/request" className="btn-primary nav-cta-btn" onClick={closeMenu}>
                        Raise Fund
                      </NavLink>

                    </li>
                  )}

                </>
              )}

              {/* DONOR */}
              {isAuthenticated && role === "donor" && (
                <>
                  <li><NavLink to="/donate" onClick={closeMenu}>Donate</NavLink></li>
                  <li><NavLink to="/my-payments" onClick={closeMenu}>My Payments</NavLink></li>
                </>
              )}

              {/* REQUESTOR */}
              {isAuthenticated && role === "user" && (
                <>
                  <li><NavLink to="/my-requests" onClick={closeMenu}>My Requests</NavLink></li>
                  <li><NavLink to="/profile" onClick={closeMenu} className="profile-icon-link" title="Profile"><FaUserCircle size={28} color="orange" /></NavLink></li>


                </>
              )}

              {/* ADMIN */}
              {isAuthenticated && role === "admin" && (
                <>
                  <li><NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink></li>
                  <li><NavLink to="/review" onClick={closeMenu}>Review Requests</NavLink></li>
                  <li><NavLink to="/payment-list" onClick={closeMenu}>Payments</NavLink></li>
                  <li><NavLink to="/userlist" onClick={closeMenu}>Users</NavLink></li>
                  <li><NavLink to="/email-status" onClick={closeMenu}>Email Status</NavLink></li>
                </>
              )}
              {/* LOGOUT */}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={() => {
                      closeMenu();
                      logOut(); // ✅ this updates context also
                    }}
                    className="btn-primary"
                    style={{ color: "black" }}
                  >
                    Logout
                  </button>
                </li>
              )}

            </ul>

          </div>
        </nav>
      </div>
    </header>
  );
}
