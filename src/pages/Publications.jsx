// src/pages/Publications.jsx
import { useState, useEffect } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import PublicationCard from "../components/PublicationCard.jsx";
import { apiGet } from "../api.js";

function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(function loadPublications() {
    let isCancelled = false;

    async function fetchPublications() {
      try {
        // The backend already sends items newest first
        const result = await apiGet("/publications?section=general");

        if (isCancelled === false) {
          setPublications(result.data);
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

    fetchPublications();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

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

    if (matchingPublications.length === 0) {
      content = (
        <p className="empty-state">No publications match your search.</p>
      );
    } else {
      content = (
        <div className="grid grid-3">
          {matchingPublications.map(function (publication) {
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