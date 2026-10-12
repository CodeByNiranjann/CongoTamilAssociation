// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Video, Users, Eye } from "lucide-react";

import HeroBanner from "../components/HeroBanner.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import EventCard from "../components/EventCard.jsx";
import FestivalCard from "../components/FestivalCard.jsx";
import JoinCTA from "../components/JoinCTA.jsx";
import { apiGet, apiPost } from "../api.js";

// Put the real committee group photo path or link here,
// for example "/images/committee-group.jpg" (file inside the public/images folder).
const groupPhotoUrl = "";

const VISIT_KEY = "cta_visit_recorded";

// Returns true if the date is today or in the future
function isUpcoming(dateValue) {
  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

function Home() {
  const [banners, setBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [visitorTotal, setVisitorTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load everything for the page. Each request is independent, so one
  // failing request does not stop the others from showing.
  useEffect(function loadHomeData() {
    let isCancelled = false;

    async function fetchAll() {
      const results = await Promise.allSettled([
        apiGet("/banners"),
        apiGet("/announcements?section=home"),
        apiGet("/events"),
        apiGet("/festivals"),
        apiGet("/contact"),
      ]);

      if (isCancelled) {
        return;
      }

      if (results[0].status === "fulfilled") {
        setBanners(results[0].value.data);
      }

      if (results[1].status === "fulfilled") {
        setAnnouncements(results[1].value.data);
      }

      if (results[2].status === "fulfilled") {
        const upcomingEvents = results[2].value.data.filter(function (item) {
          return isUpcoming(item.date);
        });
        setEvents(upcomingEvents.slice(0, 3));
      }

      if (results[3].status === "fulfilled") {
        const all = results[3].value.data;

        const upcoming = all.filter(function (item) {
          return isUpcoming(item.date);
        });

        const past = all
          .filter(function (item) {
            return isUpcoming(item.date) === false;
          })
          .reverse();

        // Upcoming festivals first, then the most recent past ones
        setFestivals(upcoming.concat(past).slice(0, 3));
      }

      if (results[4].status === "fulfilled") {
        setYoutubeUrl(results[4].value.data.youtubeUrl || "");
      }

      const allFailed = results.every(function (item) {
        return item.status === "rejected";
      });

      if (allFailed) {
        setError("Cannot reach the server. Please try again later.");
      }

      setLoading(false);
    }

    fetchAll();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  // Record one visit per browser session, then show the total.
  useEffect(function recordVisitAndLoadTotal() {
    let isCancelled = false;

    async function countVisit() {
      try {
        if (sessionStorage.getItem(VISIT_KEY) !== "yes") {
          sessionStorage.setItem(VISIT_KEY, "yes");
          await apiPost("/visitors/hit", {});
        }

        const result = await apiGet("/visitors/total");

        if (isCancelled === false) {
          setVisitorTotal(result.total);
        }
      } catch (err) {
        // The counter is not important enough to show an error for
      }
    }

    countVisit();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  let youtubeSection = null;
  if (youtubeUrl) {
    youtubeSection = (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline"
      >
        <Video size={18} /> Watch us on YouTube
      </a>
    );
  }

  let groupPhoto = (
    <div className="group-photo group-photo-placeholder">
      <Users size={48} aria-hidden="true" />
      <p>The current committee group photograph will appear here.</p>
    </div>
  );

  if (groupPhotoUrl) {
    groupPhoto = (
      <img
        className="group-photo"
        src={groupPhotoUrl}
        alt="Current CTA committee"
        loading="lazy"
      />
    );
  }

  let visitorSection = null;
  if (visitorTotal !== null) {
    visitorSection = (
      <section className="visitor-counter">
        <div className="container">
          <Eye size={18} aria-hidden="true" />
          <span>Website visits: {visitorTotal}</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <HeroBanner banners={banners} loading={loading} />

      {error && (
        <div className="container">
          <p className="alert alert-error">{error}</p>
        </div>
      )}

      {/* Announcements */}
      <section className="section">
        <div className="container">
          <SectionTitle
            title="Announcements"
            subtitle="Important news from the association"
          />
          <Announcement announcements={announcements} loading={loading} />
        </div>
      </section>

      {/* Short introduction */}
      <section className="section section-alt">
        <div className="container home-intro">
          <SectionTitle title="Welcome to CTA" />
          <p>
            Congo Tamil Association brings Tamil families together to keep our
            language, culture, and friendships alive.
          </p>
          <div className="home-intro-actions">
            <Link to="/about" className="btn btn-primary">
              Learn More About Us
            </Link>
            {youtubeSection}
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="section">
        <div className="container">
          <SectionTitle
            title="Upcoming Events"
            subtitle="Join us at our next gathering"
          />
          {loading ? (
            <p className="loading-state">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="empty-state">No upcoming events right now.</p>
          ) : (
            <div className="grid grid-3">
              {events.map(function (event) {
                return <EventCard key={event._id} event={event} />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* Festivals and activities */}
      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            title="Festivals and Activities"
            subtitle="Celebrating our culture together"
          />
          {loading ? (
            <p className="loading-state">Loading festivals...</p>
          ) : festivals.length === 0 ? (
            <p className="empty-state">Festival details will be added soon.</p>
          ) : (
            <div className="grid grid-3">
              {festivals.map(function (festival) {
                return <FestivalCard key={festival._id} festival={festival} />;
              })}
            </div>
          )}
          <div className="text-center home-more">
            <Link to="/festivals" className="btn btn-outline">
              View All Festivals
            </Link>
          </div>
        </div>
      </section>

      {/* Current committee group photograph */}
      <section className="section">
        <div className="container">
          <SectionTitle
            title="Our Current Committee"
            subtitle="The team serving our community"
          />
          {groupPhoto}
          <div className="text-center home-more">
            <Link to="/committee" className="btn btn-outline">
              Meet the Committee
            </Link>
          </div>
        </div>
      </section>

      <JoinCTA />

      {visitorSection}
    </>
  );
}

export default Home;