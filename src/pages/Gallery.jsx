// src/pages/Gallery.jsx
import { useState } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import GalleryCard from "../components/GalleryCard.jsx";

// TEMPORARY sample data (generic text, not official CTA content).
// Replaced by a real API call when the backend is ready.
const sampleGalleries = [
  {
    _id: "g1",
    title: "Sample album without cover",
    date: "2026-06-10",
    description: "Real albums come from the admin dashboard.",
    coverImageUrl: "",
    albumLink: "",
  },
  {
    _id: "g2",
    title: "Sample album with cover",
    date: "2026-08-22",
    description: "Click the image to open the larger view.",
    coverImageUrl: "https://picsum.photos/id/1015/900/600",
    albumLink: "https://drive.google.com",
  },
  {
    _id: "g3",
    title: "Sample older album",
    date: "2025-12-05",
    description: "Albums are shown newest first.",
    coverImageUrl: "https://picsum.photos/id/1011/900/600",
    albumLink: "https://drive.google.com",
  },
];

// Returns a copy of the list sorted with the newest date first
function sortNewestFirst(items) {
  const copy = items.slice();

  copy.sort(function (a, b) {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();

    return second - first;
  });

  return copy;
}

function Gallery() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [galleries] = useState(sampleGalleries);
  const [loading] = useState(false);
  const [error] = useState("");
  const [searchText, setSearchText] = useState("");

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

    const sortedGalleries = sortNewestFirst(matchingGalleries);

    if (sortedGalleries.length === 0) {
      content = <p className="empty-state">No albums match your search.</p>;
    } else {
      content = (
        <div className="grid grid-3">
          {sortedGalleries.map(function (gallery) {
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