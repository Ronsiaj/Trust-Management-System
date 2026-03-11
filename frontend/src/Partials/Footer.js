import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">

        <div className="footer-grid">

          {/* TRUST INFO */}
          <div className="footer-col">
            <h5 className="footer-title">Helping Hands Trust</h5>
            <p className="footer-text">
              A charitable trust focused on emergency medical help,
              elder & child care, accident relief, and support for
              small livelihood needs.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-col">
            <h6 className="footer-title">Quick Links</h6>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/publicview">Requests</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/donators">Donators</Link></li>
              <li><Link to="/request">Need Help</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-col">
            <h6 className="footer-title">Contact</h6>
            <ul className="footer-links footer-contact">
              <li>
                <FaEnvelope />
                <span>info@helpinghandstrust.org</span>
              </li>
              <li>
                <FaPhoneAlt />
                <span>+91 9987654321</span>
              </li>
              <li>
                <FaMapMarkerAlt />
                <span>Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="footer-col">
            <h6 className="footer-title">Follow Us</h6>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Helping Hands Trust.
          <span> Care with Purpose.</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
