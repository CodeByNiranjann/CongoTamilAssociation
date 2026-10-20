// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Video, Eye, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import HeroBanner from "../components/HeroBanner.jsx";

import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import EventCard from "../components/EventCard.jsx";
import FestivalCard from "../components/FestivalCard.jsx";
import JoinCTA from "../components/JoinCTA.jsx";
import { apiGet, apiPost } from "../api.js";

const EVENT_CAROUSEL_INTERVAL = 4000; // 4 seconds

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

  // Admin Files photo carousel state
  const [fileImages, setFileImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);


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
        apiGet("/files?type=image"),
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

      if (results[5].status === "fulfilled") {
        // Only images uploaded through Admin -> Files
        var images = (results[5].value.data || []).filter(function (item) {
          return item.fileType === "image" && item.fileUrl && item.fileUrl.trim() !== "";
        });
        setFileImages(images);
      }

      var allFailed = results.every(function (item) {
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

  // Admin Files carousel: auto-advance every 4 seconds
  useEffect(
    function startFileCarousel() {
      if (fileImages.length < 2 || carouselPaused) {
        return;
      }

      var timerId = setInterval(function () {
        setCarouselIndex(function (prev) {
          return (prev + 1) % fileImages.length;
        });
      }, EVENT_CAROUSEL_INTERVAL);

      return function stopFileCarousel() {
        clearInterval(timerId);
      };
    },
    [fileImages.length, carouselPaused]
  );

  // Keep carousel index valid if file data changes
  useEffect(
    function resetCarouselIndex() {
      if (carouselIndex >= fileImages.length) {
        setCarouselIndex(0);
      }
    },
    [fileImages.length, carouselIndex]
  );

  function goToNextSlide() {
    setCarouselIndex(function (prev) {
      return (prev + 1) % fileImages.length;
    });
  }

  function goToPrevSlide() {
    setCarouselIndex(function (prev) {
      return (prev - 1 + fileImages.length) % fileImages.length;
    });
  }

  // Build carousel content exclusively from Admin Files images
  var carouselContent = null;
  if (loading) {
    carouselContent = (
      <div className="event-carousel-empty">
        <p className="loading-state">Loading images...</p>
      </div>
    );
  } else if (fileImages.length === 0) {
    carouselContent = (
      <div className="event-carousel-empty">
        <ImageIcon size={48} aria-hidden="true" />
        <p>No photos uploaded yet in Admin &rarr; Files.</p>
      </div>
    );
  } else {
    var showCarouselControls = fileImages.length > 1;

    carouselContent = (
      <div
        className="event-carousel"
        aria-roledescription="carousel"
        aria-label="Community photos"
        onMouseEnter={function () { setCarouselPaused(true); }}
        onMouseLeave={function () { setCarouselPaused(false); }}
      >
        {fileImages.map(function (item, index) {
          var slideClass = "event-carousel-slide";
          if (index === carouselIndex) {
            slideClass = "event-carousel-slide active";
          }

          return (
            <div key={item._id || index} className={slideClass} aria-hidden={index !== carouselIndex}>
              <img
                className="event-carousel-img"
                src={item.fileUrl}
                alt={item.title || "Community photo"}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {item.title && (
                <div className="event-carousel-overlay">
                  <h3 className="event-carousel-title">{item.title}</h3>
                </div>
              )}
            </div>
          );
        })}

        {showCarouselControls && (
          <>
            <button
              type="button"
              className="event-carousel-arrow event-carousel-arrow-left"
              aria-label="Previous photo"
              onClick={goToPrevSlide}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className="event-carousel-arrow event-carousel-arrow-right"
              aria-label="Next photo"
              onClick={goToNextSlide}
            >
              <ChevronRight size={24} />
            </button>

            <div className="event-carousel-dots">
              {fileImages.map(function (item, index) {
                var dotClass = "event-carousel-dot";
                if (index === carouselIndex) {
                  dotClass = "event-carousel-dot active";
                }

                return (
                  <button
                    key={"fdot-" + index}
                    type="button"
                    className={dotClass}
                    aria-label={"Go to photo " + (index + 1)}
                    onClick={function () { setCarouselIndex(index); }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
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

      {/* Community photo carousel - from Admin Files section */}
      <section className="section">
        <div className="container">
          <SectionTitle
            title="Community Highlights"
            subtitle="Moments and memories from our community"
          />
          {carouselContent}
        </div>
      </section>

      <JoinCTA />

      {visitorSection}
    </>
  );
}

export default Home;