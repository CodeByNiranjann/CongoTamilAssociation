// src/components/FestivalCard.jsx
import { Calendar, Sparkles } from "lucide-react";

// Each festival object looks like this (it will come from the admin dashboard later):
// { _id, title, date, description, imageUrl, galleryLink }

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

// Returns "upcoming" or "past" depending on the festival date
function getFestivalStatus(dateValue) {
  if (!dateValue) {
    return "";
  }

  const festivalDate = new Date(dateValue);

  if (isNaN(festivalDate.getTime())) {
    return "";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (festivalDate >= today) {
    return "upcoming";
  }

  return "past";
}

function FestivalCard(props) {
  const festival = props.festival;

  const dateText = formatDate(festival.date);
  const status = getFestivalStatus(festival.date);

  let imageSection = (
    <div className="card-image card-image-placeholder" aria-hidden="true">
      <Sparkles size={40} />
    </div>
  );

  if (festival.imageUrl) {
    imageSection = (
      <img
        className="card-image festival-image"
        src={festival.imageUrl}
        alt={festival.title}
        loading="lazy"
      />
    );
  }

  let statusBadge = null;
  if (status === "upcoming") {
    statusBadge = <span className="card-badge badge-upcoming">Upcoming</span>;
  }
  if (status === "past") {
    statusBadge = <span className="card-badge badge-past">Past</span>;
  }

  return (
    <article className="card festival-card">
      <div className="card-image-wrap">
        {imageSection}
        {statusBadge}
      </div>

      <div className="card-body">
        <h3 className="card-title">{festival.title}</h3>

        {dateText && (
          <p className="card-meta">
            <Calendar size={16} />
            <span>{dateText}</span>
          </p>
        )}

        {festival.description && (
          <p className="card-text">{festival.description}</p>
        )}

        {festival.galleryLink && (
          <a
            href={festival.galleryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline card-button"
          >
            View Photos
          </a>
        )}
      </div>
    </article>
  );
}

export default FestivalCard;