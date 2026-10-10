// src/pages/Festivals.jsx
import { useState } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import FestivalCard from "../components/FestivalCard.jsx";
import EventCard from "../components/EventCard.jsx";

// TEMPORARY sample data (generic text, not official CTA content).
// Each list is replaced by a real API call when the backend is ready.
const sampleFestivals = [
  {
    _id: "f1",
    title: "Sample upcoming festival",
    date: "2027-01-14",
    description: "Real festivals come from the admin dashboard.",
    imageUrl: "",
    galleryLink: "",
  },
  {
    _id: "f2",
    title: "Sample past festival",
    date: "2026-04-14",
    description: "This festival has a photo link.",
    imageUrl: "",
    galleryLink: "https://drive.google.com",
  },
];

const sampleEvents = [
  {
    _id: "e1",
    title: "Sample upcoming event",
    date: "2027-01-20",
    location: "Sample location",
    description: "Real events come from the admin dashboard.",
    imageUrl: "",
    galleryLink: "",
  },
  {
    _id: "e2",
    title: "Sample past event",
    date: "2026-03-15",
    location: "Sample location",
    description: "This event has a gallery link.",
    imageUrl: "",
    galleryLink: "https://drive.google.com",
  },
];

// Returns true if the date is today or in the future
function isUpcoming(dateValue) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

// Sorts oldest first (for upcoming) or newest first (for past)
function sortByDate(items, newestFirst) {
  const copy = items.slice();

  copy.sort(function (a, b) {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();

    if (newestFirst) {
      return second - first;
    }
    return first - second;
  });

  return copy;
}

function Festivals() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [festivals] = useState(sampleFestivals);
  const [events] = useState(sampleEvents);
  const [loading] = useState(false);
  const [error] = useState("");

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">Loading festivals and events...</p>
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

  const upcomingFestivals = sortByDate(
    festivals.filter(function (item) {
      return isUpcoming(item.date);
    }),
    false
  );

  const pastFestivals = sortByDate(
    festivals.filter(function (item) {
      return isUpcoming(item.date) === false;
    }),
    true
  );

  const upcomingEvents = sortByDate(
    events.filter(function (item) {
      return isUpcoming(item.date);
    }),
    false
  );

  const pastEvents = sortByDate(
    events.filter(function (item) {
      return isUpcoming(item.date) === false;
    }),
    true
  );

  function renderFestivals(list, emptyText) {
    if (list.length === 0) {
      return <p className="empty-state">{emptyText}</p>;
    }

    return (
      <div className="grid grid-3">
        {list.map(function (festival) {
          return <FestivalCard key={festival._id} festival={festival} />;
        })}
      </div>
    );
  }

  function renderEvents(list, emptyText) {
    if (list.length === 0) {
      return <p className="empty-state">{emptyText}</p>;
    }

    return (
      <div className="grid grid-3">
        {list.map(function (event) {
          return <EventCard key={event._id} event={event} />;
        })}
      </div>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Festivals and Events</h1>
          <p className="page-header-text">
            Celebrating our culture and coming together as a community.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Upcoming Festivals" />
          {renderFestivals(upcomingFestivals, "No upcoming festivals right now.")}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="Upcoming Events" />
          {renderEvents(upcomingEvents, "No upcoming events right now.")}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="Past Festivals" />
          {renderFestivals(pastFestivals, "No past festivals to show.")}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="Past Events" />
          {renderEvents(pastEvents, "No past events to show.")}
        </div>
      </section>
    </>
  );
}

export default Festivals;