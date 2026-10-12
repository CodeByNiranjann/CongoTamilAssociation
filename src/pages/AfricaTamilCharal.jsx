// src/pages/AfricaTamilCharal.jsx
import { useState, useEffect } from "react";
import { Newspaper, FileText } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import PublicationCard from "../components/PublicationCard.jsx";
import { apiGet } from "../api.js";

const emptyInfo = {
  introduction: "",
  images: [],
};

function AfricaTamilCharal() {
  const [info, setInfo] = useState(emptyInfo);
  const [announcements, setAnnouncements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function loadAfricaTamilCharal() {
    let isCancelled = false;

    async function fetchAll() {
      try {
        const results = await Promise.all([
          apiGet("/africa-tamil-charal"),
          apiGet("/announcements?section=africa-tamil-charal"),
          apiGet("/publications?section=africa-tamil-charal"),
          apiGet("/africa-tamil-charal/documents"),
        ]);

        if (isCancelled === false) {
          setInfo({
            introduction: results[0].data.introduction || "",
            images: results[0].data.images || [],
          });
          setAnnouncements(results[1].data);
          setPublications(results[2].data);
          setDocuments(results[3].data);
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
          <p className="loading-state">Loading Africa Tamil Charal...</p>
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
    <p className="empty-state">Information will be added soon.</p>
  );
  if (info.introduction) {
    introContent = <p>{info.introduction}</p>;
  }

  let publicationsContent = (
    <p className="empty-state">Publications will be added soon.</p>
  );
  if (publications.length > 0) {
    publicationsContent = (
      <div className="grid grid-3">
        {publications.map(function (publication) {
          return (
            <PublicationCard key={publication._id} publication={publication} />
          );
        })}
      </div>
    );
  }

  let documentsSection = null;
  if (documents.length > 0) {
    documentsSection = (
      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="Documents" />
          <ul className="about-list">
            {documents.map(function (document) {
              return (
                <li key={document._id}>
                  <a
                    href={document.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={16} /> {document.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  let imagesSection = null;
  if (info.images.length > 0) {
    imagesSection = (
      <section className="section">
        <div className="container">
          <SectionTitle title="Photos" />
          <div className="grid grid-3">
            {info.images.map(function (imageUrl, index) {
              return (
                <img
                  key={index}
                  className="about-photo"
                  src={imageUrl}
                  alt={"Africa Tamil Charal photo " + (index + 1)}
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
          <h1 className="page-header-title">Africa Tamil Charal</h1>
          <p className="page-header-text">
            News, publications, and updates from Africa Tamil Charal.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <Newspaper size={28} />
            </span>
            <h2 className="about-card-title">About Africa Tamil Charal</h2>
            {introContent}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="Announcements" />
          <Announcement announcements={announcements} loading={false} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Publications" />
          {publicationsContent}
        </div>
      </section>

      {documentsSection}
      {imagesSection}
    </>
  );
}

export default AfricaTamilCharal;