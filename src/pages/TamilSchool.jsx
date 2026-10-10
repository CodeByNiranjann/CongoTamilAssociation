// src/pages/TamilSchool.jsx
import { useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";

// TEMPORARY content. I have not invented any school details, timings, or fees.
// Replace these with the official Tamil School information.
// Anything left empty shows a "will be added soon" message.
// Later, all of this comes from the admin "Tamil School" section.
const sampleSchool = {
  introduction: "",
  activities: [],
  images: [],
};

const sampleAnnouncements = [
  {
    _id: "ts1",
    title: "Sample school announcement",
    message: "Real announcements come from the admin dashboard.",
    date: "2026-10-10",
  },
];

function TamilSchool() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [school] = useState(sampleSchool);
  const [announcements] = useState(sampleAnnouncements);
  const [loading] = useState(false);
  const [error] = useState("");

  let introContent = (
    <p className="empty-state">School information will be added soon.</p>
  );
  if (school.introduction) {
    introContent = <p>{school.introduction}</p>;
  }

  let activitiesContent = (
    <p className="empty-state">Activities will be added soon.</p>
  );
  if (school.activities.length > 0) {
    activitiesContent = (
      <ul className="about-list">
        {school.activities.map(function (activity, index) {
          return <li key={index}>{activity}</li>;
        })}
      </ul>
    );
  }

  let imagesSection = null;
  if (school.images.length > 0) {
    imagesSection = (
      <section className="section">
        <div className="container">
          <SectionTitle title="School Photos" />
          <div className="grid grid-3">
            {school.images.map(function (imageUrl, index) {
              return (
                <img
                  key={index}
                  className="about-photo"
                  src={imageUrl}
                  alt={"Tamil School photo " + (index + 1)}
                  loading="lazy"
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">Loading Tamil School...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <p className="alert alert-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Tamil School</h1>
          <p className="page-header-text">
            Learning the Tamil language and culture together.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2">
          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <GraduationCap size={28} />
            </span>
            <h2 className="about-card-title">About the School</h2>
            {introContent}
          </div>

          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <BookOpen size={28} />
            </span>
            <h2 className="about-card-title">Activities</h2>
            {activitiesContent}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="School Announcements" />
          <Announcement announcements={announcements} loading={false} />
        </div>
      </section>

      {imagesSection}
    </>
  );
}

export default TamilSchool;