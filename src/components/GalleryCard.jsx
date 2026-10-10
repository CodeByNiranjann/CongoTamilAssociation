// src/components/GalleryCard.jsx
import { useState, useEffect } from "react";
import { Calendar, Images, ExternalLink, X } from "lucide-react";

// Each gallery object looks like this (it will come from the admin dashboard later):
// { _id, title, date, description, coverImageUrl, albumLink }

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function GalleryCard(props) {
  const gallery = props.gallery;

  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const dateText = formatDate(gallery.date);

  function openViewer() {
    if (gallery.coverImageUrl) {
      setIsViewerOpen(true);
    }
  }

  function closeViewer() {
    setIsViewerOpen(false);
  }

  // Close the viewer with the Escape key
  useEffect(
    function listenForEscape() {
      if (isViewerOpen === false) {
        return;
      }

      function handleKeyDown(event) {
        if (event.key === "Escape") {
          setIsViewerOpen(false);
        }
      }

      document.addEventListener("keydown", handleKeyDown);

      return function cleanup() {
        document.removeEventListener("keydown", handleKeyDown);
      };
    },
    [isViewerOpen]
  );

  let imageSection = (
    <div className="card-image card-image-placeholder" aria-hidden="true">
      <Images size={40} />
    </div>
  );

  if (gallery.coverImageUrl) {
    imageSection = (
      <button
        type="button"
        className="gallery-image-button"
        onClick={openViewer}
        aria-label={"View larger image: " + gallery.title}
      >
        <img
          className="card-image"
          src={gallery.coverImageUrl}
          alt={gallery.title}
          loading="lazy"
        />
      </button>
    );
  }

  return (
    <>
      <article className="card gallery-card">
        <div className="card-image-wrap">{imageSection}</div>

        <div className="card-body">
          <h3 className="card-title">{gallery.title}</h3>

          {dateText && (
            <p className="card-meta">
              <Calendar size={16} />
              <span>{dateText}</span>
            </p>
          )}

          {gallery.description && (
            <p className="card-text">{gallery.description}</p>
          )}

          {gallery.albumLink && (
            <a
              href={gallery.albumLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary card-button"
            >
              View Album <ExternalLink size={16} />
            </a>
          )}
        </div>
      </article>

      {isViewerOpen && (
        <div
          className="image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={gallery.title}
          onClick={closeViewer}
        >
          <button
            type="button"
            className="image-viewer-close"
            aria-label="Close image"
            onClick={closeViewer}
          >
            <X size={28} />
          </button>
          <img
            className="image-viewer-img"
            src={gallery.coverImageUrl}
            alt={gallery.title}
            onClick={function (event) {
              event.stopPropagation();
            }}
          />
        </div>
      )}
    </>
  );
}

export default GalleryCard;