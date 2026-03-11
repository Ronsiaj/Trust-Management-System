import gallery1 from "../Assets/images/gallery1.png";
import gallery2 from "../Assets/images/gallery2.jpeg";
import gallery3 from "../Assets/images/gallery3.jpg.jpeg";
import gallery4 from "../Assets/images/gallery4.jpg.jpeg";
import gallery5 from "../Assets/images/gallery5.jpg.jpeg";
import gallery6 from "../Assets/images/gallery6.png";
import gallery7 from "../Assets/images/gallery7.jpeg";
import gallery8 from "../Assets/images/gallery8.jpg.jpeg";
import gallery9 from "../Assets/images/gallery9.png";

const galleryData = [
  {
    id: 1,
    date: "05 Dec 2025",
    title: "Medical Help Camp",
    image: gallery1,
  },
  {
    id: 2,
    date: "12 Jan 2026",
    title: "Accident Relief Support",
    image: gallery2,
  },
  {
    id: 3,
    date: "20 Jan 2026",
    title: "Elder Care Program",
    image: gallery3,
  },
  {
    id: 4,
    date: "02 Feb 2026",
    title: "Child Medical Assistance",
    image: gallery4,
  },
  {
    id: 5,
    date: "10 Feb 2026",
    title: "Livelihood Support",
    image: gallery5,
  },
  {
    id: 6,
    date: "18 Feb 2026",
    title: "Community Food Drive",
    image: gallery6,
  },
  {
    id: 7,
    date: "25 Feb 2026",
    title: "Emergency Hospital Visit",
    image: gallery7,
  },
  {
    id: 8,
    date: "03 Mar 2026",
    title: "Village Health Camp",
    image: gallery8,
  },
  {
    id: 9,
    date: "12 Mar 2026",
    title: "Senior Citizen Care",
    image: gallery9,
  },
];

const Gallery = () => {
  return (
    <div className="gallery-page">

     {/* ================= PAGE HERO ================= */}
<section className="page-hero">
  <div className="container">
    <h1>Our Gallery</h1>
    <p>
      Moments of care, compassion, and service from our foundation
      activities.
    </p>
  </div>
</section>


      {/* ================= GALLERY SECTION ================= */}
      <section className="gallery-section">
        <div className="container">

          {/* ================= GRID ================= */}
          <div className="gallery-grid">
            {galleryData.map((item) => (
              <div className="gallery-card" key={item.id}>

                {/* IMAGE */}
                <div
                  className="gallery-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <span className="gallery-date">{item.date}</span>
                </div>

                {/* CONTENT */}
                <div className="gallery-content">
                  <h5>{item.title}</h5>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Gallery;
