import { Link } from "react-router-dom";
import Slider from "react-slick";
import DonateButton from "../Components/DonateButton"; // <-- add this

// Your local images
import hero1 from "../Assets/images/home1.png";
import hero2 from "../Assets/images/home2.jpg";
import hero3 from "../Assets/images/home3.png";
import hero4 from "../Assets/images/home4.jpg";

// Slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 3500,
    fade: true,
    pauseOnHover: false,
  };

  const slides = [hero1, hero2, hero3, hero4];

  return (
    <div className="home-page">
      {/* ================= HERO SLIDER ================= */}
      <section className="hero-slider">
        <Slider {...settings}>
          {slides?.map((img, index) => (
            <div className="hero-slide" key={index}>
              <img src={img} alt="Foundation Work" />

              {/* OVERLAY */}
              <div className="hero-overlay">
                <div className="container">
                  <div className="hero-overlay-content animate-hero-text">
                    <span className="hero-tag">
                     Helping Hands Trust
                    </span>

                    <h1>
                      Together We Can <span>Save Lives</span>
                    </h1>

                    <p>
                      Supporting medical emergencies, elder care, child care and
                      families in need across Tamil Nadu. Even a small help can
                      create a big impact.
                    </p>

                    {/* ================= HERO ACTIONS ================= */}

                    {/* DONATE */}
                    <div className="hero-actions">
                      <DonateButton
                        className="hero-btn hero-btn-primary"
                        label="Donate Now"
                        redirectAfterLogin="/donate"
                      />

                      <DonateButton
                        className="hero-btn hero-btn-secondary"
                        label="Need Help"
                        redirectAfterLogin="/request"
                      />

                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>500+</h3>
              <p>Families Helped</p>
            </div>

            <div className="stat-card">
              <h3>₹10L+</h3>
              <p>Funds Raised</p>
            </div>

            <div className="stat-card">
              <h3>120+</h3>
              <p>Medical Emergencies</p>
            </div>

            <div className="stat-card">
              <h3>300+</h3>
              <p>Active Donors</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT PREVIEW ================= */}
      <section className="about-preview section-light">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Who We Are</h2>

              <p>
                Helping Hands Trust is a non-profit trust working to
                support people during the most difficult moments of their lives.
                We focus on emergency medical help, accident relief, elder care,
                child care and livelihood support.
              </p>

              <Link to="/about" className="btn-outline">
                Learn More
              </Link>
            </div>

            <div className="about-image">
              <img
                src="https://images.unsplash.com/photo-1509099836639-18ba1795216d"
                alt="Charity Work"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Your Small Help Can Change Someone’s Life</h2>

            <p>
              Support a family in need, or raise a fund if you are facing a
              medical or emergency situation.
            </p>

            <div className="cta-buttons">
              <DonateButton
                className="btn-primary"
                label="Donate Now"
                redirectAfterLogin="/donate"
              />

              <DonateButton
                className="btn-primary"
                label="Raise Fund"
                redirectAfterLogin="/request"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
