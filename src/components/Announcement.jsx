// src/components/Announcement.jsx
import { useState } from "react";
import { Megaphone, X } from "lucide-react";

// Each announcement object looks like this (it will come from the admin dashboard later):
// { _id, title, message, date }

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
    month: "short",
    year: "numeric",
  });
}

function Announcement(props) {
  const announcements = props.announcements || [];

  // Keeps track of which announcements the visitor has closed
  const [closedIds, setClosedIds] = useState([]);

  function closeAnnouncement(id) {
    setClosedIds(closedIds.concat(id));
  }

  // Loading state
  if (props.loading) {
    return <p className="loading-state">Loading announcements...</p>;
  }

  // Remove the ones the visitor closed
  const visibleAnnouncements = announcements.filter(function (item) {
    return closedIds.includes(item._id) === false;
  });

  // Empty state
  if (visibleAnnouncements.length === 0) {
    return <p className="empty-state">No announcements right now.</p>;
  }

  return (
    <div className="announcement-list">
      {visibleAnnouncements.map(function (item) {
        const dateText = formatDate(item.date);

        return (
          <div key={item._id} className="announcement-item" role="note">
            <span className="announcement-icon" aria-hidden="true">
              <Megaphone size={22} />
            </span>

            <div className="announcement-body">
              <h3 className="announcement-title">{item.title}</h3>
              {item.message && (
                <p className="announcement-message">{item.message}</p>
              )}
              {dateText && (
                <span className="announcement-date">{dateText}</span>
              )}
            </div>

            <button
              type="button"
              className="announcement-close"
              aria-label={"Close announcement: " + item.title}
              onClick={function () {
                closeAnnouncement(item._id);
              }}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Announcement;