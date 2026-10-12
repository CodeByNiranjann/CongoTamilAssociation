// src/pages/TamilSchool.jsx
import { useState, useEffect } from "react";
import { GraduationCap, BookOpen } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import { apiGet } from "../api.js";

const emptySchool = {
  introduction: "",
  activities: [],
  images: [],
};

function TamilSchool() {
  const [school, setSchool] = useState(emptySchool);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function loadTamilSchool() {
    let isCancelled = false;

    async function fetchAll() {
      try {
        const results = await Promise.all([
          apiGet("/tamil-school"),
          apiGet("/announcements?section=tamil-school"),
        ]);

        if (isCancelled === false) {
          setSchool({
            introduction: results[0].data.introduction || "",
            activities: results[0].data.activities || [],
            images: results[0].data.images || [],
          });
          setAnnouncements(results[1].data);
        }
      } catch (err) {
        if (isCancelled === false) {
          setError(err.message);
        }
      } finally {
        if (isCancelled === false) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

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