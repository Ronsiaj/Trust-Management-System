import { FaPhoneAlt,FaEnvelope,FaMapMarkerAlt,FaUser,FaPaperPlane,} from "react-icons/fa";

const Contact = () => {
  return (
    <div className="contact-page">

      {/* ================= PAGE HERO (DO NOT TOUCH) ================= */}
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>
            Need assistance or have questions? We are always ready to help you.
          </p>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="foundation-contact">
        <div className="container">

          <div className="foundation-contact-grid">

            {/* ========== LEFT : INFO ========= */}
            <div className="foundation-contact-info">
              <h2>Let’s Talk</h2>
              <p>
                If you need support, have questions, or wish to contribute towards
                our initiatives, our foundation team is always here to help.
              </p>

              <div className="contact-item">
                <FaPhoneAlt />
                <div>
                  <h5>Phone</h5>
                  <p>+91 9987654321</p>
                </div>
              </div>

              <div className="contact-item">
                <FaEnvelope />
                <div>
                  <h5>Email</h5>
                  <p>info@helpinghandstrust.org</p>
                </div>
              </div>

              <div className="contact-item">
                <FaMapMarkerAlt />
                <div>
                  <h5>Address</h5>
                  <p>
                    Chennai, Tamil Nadu, India<br />
                    Tamil Nadu – 600053
                  </p>
                </div>
              </div>
            </div>

            {/* ========== RIGHT : FORM ========= */}
            <div className="foundation-contact-form">
              <h2>Connect With Us</h2>

              <form>
                <div className="input-field">
                  <FaUser />
                  <input type="text" placeholder="Full Name" required />
                </div>

                <div className="input-field">
                  <FaPhoneAlt />
                  <input type="tel" placeholder="Mobile Number" required />
                </div>

                <div className="input-field">
                  <FaEnvelope />
                  <input type="email" placeholder="Email Address" required />
                </div>

                <textarea
                  rows="4"
                  placeholder="Your message..."
                  required
                ></textarea>

                <button type="submit">
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            </div>

          </div>

          {/* ========== MAP ========= */}
          <div className="foundation-map">
            <iframe
              title="Foundation Location"
              src="https://www.google.com/maps?q=Chennai&output=embed"
              loading="lazy"
            ></iframe>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
