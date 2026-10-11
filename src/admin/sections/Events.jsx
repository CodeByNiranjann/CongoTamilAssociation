// src/admin/sections/Events.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

// TEMPORARY sample data (generic text, not official CTA content).
// Add, edit, delete and publish only change this page's memory for now.
// They are connected to the real backend API later.
// Image upload: for now you paste an image URL. Later this becomes a file upload to Cloudinary.
const startingEvents = [
  {
    _id: "e1",
    title: "Sample upcoming event",
    date: "2027-01-20",
    location: "Sample location",
    description: "Sample description.",
    imageUrl: "",
    galleryLink: "",
    isPublished: true,
  },
  {
    _id: "e2",
    title: "Sample past event",
    date: "2026-03-15",
    location: "",
    description: "",
    imageUrl: "",
    galleryLink: "https://drive.google.com",
    isPublished: false,
  },
];

const emptyForm = {
  title: "",
  date: "",
  location: "",
  description: "",
  imageUrl: "",
  galleryLink: "",
  isPublished: true,
};

function Events() {
  const [events, setEvents] = useState(startingEvents);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  function handleChange(event) {
    const fieldName = event.target.name;
    let fieldValue = event.target.value;

    if (event.target.type === "checkbox") {
      fieldValue = event.target.checked;
    }

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.title.trim() === "") {
      newErrors.title = "Event name is required.";
    }

    if (formData.title.length > 120) {
      newErrors.title = "Event name must be 120 characters or fewer.";
    }

    if (formData.date === "") {
      newErrors.date = "Date is required.";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or fewer.";
    }

    const imageUrl = formData.imageUrl.trim();
    if (imageUrl !== "" && /^(https?:\/\/|\/)/.test(imageUrl) === false) {
      newErrors.imageUrl = "Enter a full link (https://...) or a path starting with /.";
    }

    const galleryLink = formData.galleryLink.trim();
    if (galleryLink !== "" && /^https?:\/\//.test(galleryLink) === false) {
      newErrors.galleryLink = "Enter a full link starting with https://";
    }

    return newErrors;
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId("");
    setErrors({});
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cleanData = {
      title: formData.title.trim(),
      date: formData.date,
      location: formData.location.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
      galleryLink: formData.galleryLink.trim(),
      isPublished: formData.isPublished,
    };

    if (editingId) {
      const updatedList = events.map(function (item) {
        if (item._id === editingId) {
          return { ...item, ...cleanData };
        }
        return item;
      });
      setEvents(updatedList);
      setMessage("Event updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setEvents([newItem, ...events]);
      setMessage("Event added.");
    }

    resetForm();
  }

  function startEdit(item) {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      date: item.date,
      location: item.location || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      galleryLink: item.galleryLink || "",
      isPublished: item.isPublished,
    });
    setErrors({});
    setMessage("");
    window.scrollTo(0, 0);
  }

  function togglePublished(id) {
    const updatedList = events.map(function (item) {
      if (item._id === id) {
        return { ...item, isPublished: !item.isPublished };
      }
      return item;
    });
    setEvents(updatedList);
  }

  function confirmDelete(id) {
    const remaining = events.filter(function (item) {
      return item._id !== id;
    });
    setEvents(remaining);
    setDeleteId("");
    setMessage("Event deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Event";
  let submitText = "Add Event";
  if (editingId) {
    formTitle = "Edit Event";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Upcoming Events</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add / edit form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="event-title">Event name *</label>
            <input
              id="event-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className="admin-error">{errors.title}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="event-date">Date *</label>
            <input
              id="event-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              aria-invalid={errors.date ? "true" : "false"}
            />
            {errors.date && <span className="admin-error">{errors.date}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="event-location">Location</label>
            <input
              id="event-location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="event-description">Description</label>
          <textarea
            id="event-description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            aria-invalid={errors.description ? "true" : "false"}
          ></textarea>
          {errors.description && (
            <span className="admin-error">{errors.description}</span>
          )}
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="event-image">Poster / cover image link</label>
            <input
              id="event-image"
              name="imageUrl"
              type="text"
              placeholder="https://... or /images/event.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
              aria-invalid={errors.imageUrl ? "true" : "false"}
            />
            {errors.imageUrl && (
              <span className="admin-error">{errors.imageUrl}</span>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="event-gallery">Gallery link (optional)</label>
            <input
              id="event-gallery"
              name="galleryLink"
              type="text"
              placeholder="https://drive.google.com/..."
              value={formData.galleryLink}
              onChange={handleChange}
              aria-invalid={errors.galleryLink ? "true" : "false"}
            />
            {errors.galleryLink && (
              <span className="admin-error">{errors.galleryLink}</span>
            )}
          </div>
        </div>

        <div className="admin-check">
          <input
            id="event-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="event-published">
            Published (visible on the website)
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {submitText}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Event list */}
      <div className="admin-table-wrap">
        {events.length === 0 ? (
          <p className="empty-state">No events yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(function (item) {
                const isDeleting = deleteId === item._id;

                let statusText = "Draft";
                let statusClass = "admin-status admin-status-off";
                if (item.isPublished) {
                  statusText = "Published";
                  statusClass = "admin-status admin-status-on";
                }

                return (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.date}</td>
                    <td>
                      <button
                        type="button"
                        className={statusClass}
                        aria-label={"Toggle published for " + item.title}
                        onClick={function () {
                          togglePublished(item._id);
                        }}
                      >
                        {statusText}
                      </button>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this event?</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={function () {
                              confirmDelete(item._id);
                            }}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={function () {
                              setDeleteId("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-btn"
                            aria-label={"Edit " + item.title}
                            onClick={function () {
                              startEdit(item);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.title}
                            onClick={function () {
                              setDeleteId(item._id);
                            }}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Events;