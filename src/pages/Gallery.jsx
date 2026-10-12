// src/pages/Gallery.jsx
import { useState, useEffect } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import GalleryCard from "../components/GalleryCard.jsx";
import { apiGet } from "../api.js";

function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(function loadGalleries() {
    let isCancelled = false;

    async function fetchGalleries() {
      try {
        // The backend already sends albums newest first
        const result = await apiGet("/gallery");

        if (isCancelled === false) {
          setGalleries(result.data);
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

    fetchGalleries();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  let content = null;

  if (loading) {
    content = <p className="loading-state">Loading gallery...</p>;
  } else if (error) {
    content = <p className="alert alert-error">{error}</p>;
  } else if (galleries.length === 0) {
    content = <p className="empty-state">Gallery albums will be added soon.</p>;
  } else {
    const searchWord = searchText.trim().toLowerCase();

    const matchingGalleries = galleries.filter(function (gallery) {
      if (searchWord === "") {
        return true;
      }
      return gallery.title.toLowerCase().includes(searchWord);
    });

    if (matchingGalleries.length === 0) {
      content = <p className="empty-state">No albums match your search.</p>;
    } else {
      content = (
        <div className="grid grid-3">
          {matchingGalleries.map(function (gallery) {
            return <GalleryCard key={gallery._id} gallery={gallery} />;
          })}
        </div>
      );
    }
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Photo Gallery</h1>
          <p className="page-header-text">
            Moments from our events and celebrations.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Event Albums" />

          <div className="gallery-search">
            <label htmlFor="gallery-search-input" className="gallery-search-label">
              Search albums
            </label>
            <input
              id="gallery-search-input"
              type="search"
              className="gallery-search-input"
              placeholder="Type an event name"
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

export default Gallery;