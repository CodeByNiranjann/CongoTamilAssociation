// src/pages/ByLaws.jsx
import { useState } from "react";
import { FileText, Download } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";

// TEMPORARY content. I have not invented any rules or regulations.
// Replace these with the official CTA By-Laws.
// Later, all of this comes from the admin "By-Laws" section.
//
// Each section looks like: { _id, heading, text }
// pdfUrl example: "/documents/cta-by-laws.pdf" or a Google Drive link
const sampleByLaws = {
  intro: "",
  sections: [],
  pdfUrl: "",
};

function ByLaws() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [byLaws] = useState(sampleByLaws);
  const [loading] = useState(false);
  const [error] = useState("");

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">Loading by-laws...</p>
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

  let introContent = null;
  if (byLaws.intro) {
    introContent = <p className="bylaws-intro">{byLaws.intro}</p>;
  }

  let sectionsContent = (
    <p className="empty-state">The by-laws will be added soon.</p>
  );

  if (byLaws.sections.length > 0) {
    sectionsContent = (
      <div className="bylaws-list">
        {byLaws.sections.map(function (section, index) {
          return (
            <article key={section._id} className="bylaws-item">
              <span className="bylaws-number" aria-hidden="true">
                {index + 1}
              </span>
              <div className="bylaws-body">
                <h3 className="bylaws-heading">{section.heading}</h3>
                <p className="bylaws-text">{section.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  let pdfContent = null;
  if (byLaws.pdfUrl) {
    pdfContent = (
      <div className="text-center bylaws-download">
        <a
          href={byLaws.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          <Download size={18} /> Download By-Laws (PDF)
        </a>
      </div>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">By-Laws</h1>
          <p className="page-header-text">
            The rules and regulations of the Congo Tamil Association.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Rules and Regulations" />
          <span className="about-icon about-icon-center" aria-hidden="true">
            <FileText size={28} />
          </span>
          {introContent}
          {sectionsContent}
          {pdfContent}
        </div>
      </section>
    </>
  );
}

export default ByLaws;