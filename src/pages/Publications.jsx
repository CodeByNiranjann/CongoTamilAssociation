// src/pages/Publications.jsx
import { useState } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import PublicationCard from "../components/PublicationCard.jsx";

// TEMPORARY sample data (generic text, not official CTA content).
// Replaced by a real API call when the backend is ready.
const samplePublications = [
  {
    _id: "p1",
    title: "Sample publication without cover",
    month: 3,
    year: 2026,
    description: "Real publications come from the admin dashboard.",
    coverImageUrl: "",
    pdfLink: "",
  },
  {
    _id: "p2",
    title: "Sample publication with cover",
    month: 8,
    year: 2026,
    description: "This one has a cover image and a PDF link.",
    coverImageUrl: "https://picsum.photos/id/24/440/580",
    pdfLink: "https://drive.google.com",
  },
  {
    _id: "p3",
    title: "Sample older publication",
    month: 11,
    year: 2025,
    description: "Publications are shown newest first.",
    coverImageUrl: "https://picsum.photos/id/42/440/580",
    pdfLink: "https://drive.google.com",
  },
];

// Returns a copy of the list sorted with the newest year and month first
function sortNewestFirst(items) {
  const copy = items.slice();

  copy.sort(function (a, b) {
    const firstValue = Number(a.year || 0) * 100 + Number(a.month || 0);
    const secondValue = Number(b.year || 0) * 100 + Number(b.month || 0);

    return secondValue - firstValue;
  });

  return copy;
}

function Publications() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [publications] = useState(samplePublications);
  const [loading] = useState(false);
  const [error] = useState("");
  const [searchText, setSearchText] = useState("");

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  let content = null;

  if (loading) {
    content = <p className="loading-state">Loading publications...</p>;
  } else if (error) {
    content = <p className="alert alert-error">{error}</p>;
  } else if (publications.length === 0) {
    content = (
      <p className="empty-state">Publications will be added soon.</p>
    );
  } else {
    const searchWord = searchText.trim().toLowerCase();

    const matchingPublications = publications.filter(function (publication) {
      if (searchWord === "") {
        return true;
      }
      return publication.title.toLowerCase().includes(searchWord);
    });

    const sortedPublications = sortNewestFirst(matchingPublications);

    if (sortedPublications.length === 0) {
      content = (
        <p className="empty-state">No publications match your search.</p>
      );
    } else {
      content = (
        <div className="grid grid-3">
          {sortedPublications.map(function (publication) {
            return (
              <PublicationCard
                key={publication._id}
                publication={publication}
              />
            );
          })}
        </div>
      );
    }
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Publications and Books</h1>
          <p className="page-header-text">
            Read our magazines, books, and community publications.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Our Publications" />

          <div className="gallery-search">
            <label
              htmlFor="publication-search-input"
              className="gallery-search-label"
            >
              Search publications
            </label>
            <input
              id="publication-search-input"
              type="search"
              className="gallery-search-input"
              placeholder="Type a title"
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>

          {content}
        </div>
      </section>
    </>
  );
}

export default Publications;