// src/pages/AfricaTamilCharal.jsx
import { useState } from "react";
import { Newspaper, FileText } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import PublicationCard from "../components/PublicationCard.jsx";

// TEMPORARY content. I have not invented any details about Africa Tamil Charal.
// Replace these with the official information.
// Anything left empty shows a "will be added soon" message.
// Later, all of this comes from the admin "Africa Tamil Charal" section.
const sampleInfo = {
  introduction: "",
  images: [],
  documents: [],
};

const sampleAnnouncements = [
  {
    _id: "atc1",
    title: "Sample announcement",
    message: "Real announcements come from the admin dashboard.",
    date: "2026-10-10",
  },
];

const samplePublications = [
  {
    _id: "atp1",
    title: "Sample publication",
    month: 9,
    year: 2026,
    description: "Real publications come from the admin dashboard.",
    coverImageUrl: "",
    pdfLink: "",
  },
];

// Each document object looks like this: { _id, title, link }

function AfricaTamilCharal() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [info] = useState(sampleInfo);
  const [announcements] = useState(sampleAnnouncements);
  const [publications] = useState(samplePublications);
  const [loading] = useState(false);
  const [error] = useState("");

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
  if (info.documents.length > 0) {
    documentsSection = (
      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="Documents" />
          <ul className="about-list">
            {info.documents.map(function (document) {
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