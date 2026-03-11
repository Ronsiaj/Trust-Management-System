import { FaHandsHelping,FaBullseye,FaEye,FaShieldAlt,FaUsers,FaBolt, } from "react-icons/fa";

const About = () => {
  return (
    <div className="about-page">
      {/* ================= PAGE HERO ================= */}
      <section className="page-hero">
        <div className="container">
          <h1>About Our Foundation</h1>
          <p>
            Learn more about Helping Hands Trust and our mission to
            serve humanity with compassion and integrity.
          </p>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="about-intro">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Who We Are</h2>
              <p>
                Helping Hands Trust is a charitable trust committed to
                helping individuals and families during times of crisis. Our
                focus is on emergency medical assistance, accident relief, elder
                care, child care, and small livelihood support.
              </p>

              <p>
                We believe compassion can save lives. Even the smallest
                contribution can bring hope, dignity, and healing to someone in
                need.
              </p>
            </div>

            <div className="about-image">
              <img
                src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb"
                alt="About our foundation"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="mv-section">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <FaBullseye className="mv-icon" />
              <h3>Our Mission</h3>
              <p>
                To provide timely financial and emotional support to people
                facing medical emergencies and difficult life situations.
              </p>
            </div>

            <div className="mv-card">
              <FaEye className="mv-icon" />
              <h3>Our Vision</h3>
              <p>
                To build a compassionate society where everyone has access to
                care, dignity, and support in times of need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>

          <div className="why-grid">
            <div className="why-card">
              <FaShieldAlt />
              <h4>Transparent & Trusted</h4>
              <p>
                We maintain complete transparency in fund collection and
                distribution.
              </p>
            </div>

            <div className="why-card">
              <FaBolt />
              <h4>Fast Emergency Support</h4>
              <p>
                We prioritize urgent medical and accident-related cases to save
                lives quickly.
              </p>
            </div>

            <div className="why-card">
              <FaUsers />
              <h4>Community Driven</h4>
              <p>
                Our strength comes from donors and volunteers who believe in
                helping others.
              </p>
            </div>
          </div>
        </div>
      </section>

   {/* ================= FINAL CTA ================= */}
<section className="about-cta">
  <div className="container">

    <div className="cta-content">

      <FaHandsHelping className="cta-icon" />

      <h2>Be a Part of Our Mission</h2>

      <p className="cta-main">
        Your support helps us provide emergency medical aid, care for elders,
        support children, and stand with families during difficult times.
      </p>

      <p className="cta-sub">
        Together, we can bring hope, dignity, and a better future to those
        who need it the most.
      </p>

    </div>

  </div>
</section>


    </div>
  );
};

export default About;
