// src/pages/About.jsx
import { Link } from "react-router-dom";
import { Target, Eye, History, Heart } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";

// TEMPORARY content. Replace these with the official CTA text.
// I have not invented any history, dates, or objectives.
// Anything left empty shows a "will be added soon" message.
const introText =
  "Congo Tamil Association brings Tamil families together to keep our language, culture, and friendships alive.";

const historyText = "";
const missionText = "";
const objectives = [];

// Optional photographs. Add real image URLs or paths, for example "/images/about-1.jpg"
const aboutPhotos = [];

function About() {
  let historyContent = (
    <p className="empty-state">Our history will be added soon.</p>
  );
  if (historyText) {
    historyContent = <p>{historyText}</p>;
  }

  let missionContent = (
    <p className="empty-state">Our mission will be added soon.</p>
  );
  if (missionText) {
    missionContent = <p>{missionText}</p>;
  }

  let objectivesContent = (
    <p className="empty-state">Our objectives will be added soon.</p>
  );
  if (objectives.length > 0) {
    objectivesContent = (
      <ul className="about-list">
        {objectives.map(function (item, index) {
          return <li key={index}>{item}</li>;
        })}
      </ul>
    );
  }

  let photosSection = null;
  if (aboutPhotos.length > 0) {
    photosSection = (
      <section className="section">
        <div className="container">
          <SectionTitle title="Our Community" />
          <div className="grid grid-3">
            {aboutPhotos.map(function (photoUrl, index) {
              return (
                <img
                  key={index}
                  className="about-photo"
                  src={photoUrl}
                  alt={"CTA community photo " + (index + 1)}
                  loading="lazy"
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">About CTA</h1>
          <p className="page-header-text">{introText}</p>
        </div>
      </section>

      {/* History */}
      <section className="section">
        <div className="container about-block">
          <span className="about-icon" aria-hidden="true">
            <History size={28} />
          </span>
          <div className="about-block-content">
            <SectionTitle title="Our History" align="left" />
            {historyContent}
          </div>
        </div>
      </section>

      {/* Mission and objectives */}
      <section className="section section-alt">
        <div className="container grid grid-2">
          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <Target size={28} />
            </span>
            <h2 className="about-card-title">Our Mission</h2>
            {missionContent}
          </div>

          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <Eye size={28} />
            </span>
            <h2 className="about-card-title">Our Objectives</h2>
            {objectivesContent}
          </div>
        </div>
      </section>

      {photosSection}

      {/* Invitation */}
      <section className="section">
        <div className="container text-center">
          <span className="about-icon about-icon-center" aria-hidden="true">
            <Heart size={28} />
          </span>
          <h2>Be part of our community</h2>
          <p>Send us your details and we will get in touch with you.</p>
          <Link to="/join-cta" className="btn btn-primary">
            Join CTA
          </Link>
        </div>
      </section>
    </>
  );
}

export default About;

