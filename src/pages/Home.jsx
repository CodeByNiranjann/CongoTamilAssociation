// src/pages/Home.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Video, Users, Eye } from "lucide-react";

import HeroBanner from "../components/HeroBanner.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Announcement from "../components/Announcement.jsx";
import EventCard from "../components/EventCard.jsx";
import FestivalCard from "../components/FestivalCard.jsx";
import JoinCTA from "../components/JoinCTA.jsx";

// Fill these in only with verified CTA details.
// Anything left empty is hidden or shows a placeholder.
const youtubeUrl = "";
const groupPhotoUrl = "";

// TEMPORARY sample data (generic text, not official CTA content).
// Each list is replaced by a real API call when the backend is ready.
const sampleBanners = [
  {
    _id: "b1",
    imageUrl: "",
    title: "Congo Tamil Association",
    description: "Sample banner one",
    buttonText: "About Us",
    buttonLink: "/about",
  },
  {
    _id: "b2",
    imageUrl: "",
    title: "Our Community",
    description: "Sample banner two",
    buttonText: "Join CTA",
    buttonLink: "/join-cta",
  },
];

const sampleAnnouncements = [
  {
    _id: "a1",
    title: "Sample announcement",
    message: "Real announcements come from the admin dashboard.",
    date: "2026-10-10",
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
];

const sampleFestivals = [
  {
    _id: "f1",
    title: "Sample festival",
    date: "2027-01-14",
    description: "Real festivals come from the admin dashboard.",
    imageUrl: "",
    galleryLink: "",
  },
];

// Sample number only. The real count comes from the visitor API later.
const sampleVisitorTotal = 0;

function Home() {
  // Later: replace each useState with data loaded from the backend,
  // and set loading/error from the request.
  const [banners] = useState(sampleBanners);
  const [announcements] = useState(sampleAnnouncements);
  const [events] = useState(sampleEvents);
  const [festivals] = useState(sampleFestivals);
  const [visitorTotal] = useState(sampleVisitorTotal);
  const [loading] = useState(false);

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

  return (
    <>
      <HeroBanner banners={banners} loading={loading} />

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
          {events.length === 0 ? (
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
          {festivals.length === 0 ? (
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

      {/* Visitor counter */}
      <section className="visitor-counter">
        <div className="container">
          <Eye size={18} aria-hidden="true" />
          <span>Website visitors: {visitorTotal}</span>
        </div>
      </section>
    </>
  );
}

export default Home;