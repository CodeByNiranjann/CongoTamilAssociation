// src/components/EventCard.jsx
import { Calendar, MapPin } from "lucide-react";

// Each event object looks like this (it will come from the admin dashboard later):
// { _id, title, date, location, description, imageUrl, galleryLink }

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

// Returns "upcoming" or "past" depending on the event date
function getEventStatus(dateValue) {
  if (!dateValue) {
    return "";
  }

  const eventDate = new Date(dateValue);

  if (isNaN(eventDate.getTime())) {
    return "";
  }

  // Compare using the start of today, so today's events count as upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (eventDate >= today) {
    return "upcoming";
  }

  return "past";
}

function EventCard(props) {
  const event = props.event;

  const dateText = formatDate(event.date);
  const status = getEventStatus(event.date);

  let imageSection = (
    <div className="card-image card-image-placeholder" aria-hidden="true">
      <Calendar size={40} />
    </div>
  );

  if (event.imageUrl) {
    imageSection = (
      <img
        className="card-image"
        src={event.imageUrl}
        alt={event.title}
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
    <article className="card event-card">
      <div className="card-image-wrap">
        {imageSection}
        {statusBadge}
      </div>

      <div className="card-body">
        <h3 className="card-title">{event.title}</h3>

        {dateText && (
          <p className="card-meta">
            <Calendar size={16} />
            <span>{dateText}</span>
          </p>
        )}

        {event.location && (
          <p className="card-meta">
            <MapPin size={16} />
            <span>{event.location}</span>
          </p>
        )}

        {event.description && (
          <p className="card-text">{event.description}</p>
        )}

        {event.galleryLink && (
          <a
            href={event.galleryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline card-button"
          >
            View Gallery
          </a>
        )}
      </div>
    </article>
  );
}

export default EventCard;