// src/admin/sections/Announcements.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

// TEMPORARY sample data (generic text, not official CTA content).
// Add, edit, delete and publish only change this page's memory for now.
// They are connected to the real backend API later.
const startingAnnouncements = [
  {
    _id: "a1",
    title: "Sample announcement one",
    message: "Sample message text.",
    date: "2026-10-10",
    isPublished: true,
  },
  {
    _id: "a2",
    title: "Sample announcement two",
    message: "",
    date: "2026-10-05",
    isPublished: false,
  },
];

const emptyForm = {
  title: "",
  message: "",
  date: "",
  isPublished: true,
};

function Announcements() {
  const [announcements, setAnnouncements] = useState(startingAnnouncements);
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
      newErrors.title = "Title is required.";
    }

    if (formData.title.length > 120) {
      newErrors.title = "Title must be 120 characters or fewer.";
    }

    if (formData.message.length > 1000) {
      newErrors.message = "Message must be 1000 characters or fewer.";
    }

    if (formData.date === "") {
      newErrors.date = "Date is required.";
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
      message: formData.message.trim(),
      date: formData.date,
      isPublished: formData.isPublished,
    };

    if (editingId) {
      const updatedList = announcements.map(function (item) {
        if (item._id === editingId) {
          return { ...item, ...cleanData };
        }
        return item;
      });
      setAnnouncements(updatedList);
      setMessage("Announcement updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setAnnouncements([newItem, ...announcements]);
      setMessage("Announcement added.");
    }

    resetForm();
  }

  function startEdit(item) {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      message: item.message || "",
      date: item.date,
      isPublished: item.isPublished,
    });
    setErrors({});
    setMessage("");
    window.scrollTo(0, 0);
  }

  function togglePublished(id) {
    const updatedList = announcements.map(function (item) {
      if (item._id === id) {
        return { ...item, isPublished: !item.isPublished };
      }
      return item;
    });
    setAnnouncements(updatedList);
  }

  function confirmDelete(id) {
    const remaining = announcements.filter(function (item) {
      return item._id !== id;
    });
    setAnnouncements(remaining);
    setDeleteId("");
    setMessage("Announcement deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Announcement";
  let submitText = "Add Announcement";
  if (editingId) {
    formTitle = "Edit Announcement";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Announcements</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add / edit form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="announcement-title">Title *</label>
            <input
              id="announcement-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className="admin-error">{errors.title}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="announcement-date">Date *</label>
            <input
              id="announcement-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              aria-invalid={errors.date ? "true" : "false"}
            />
            {errors.date && <span className="admin-error">{errors.date}</span>}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="announcement-message">Message (optional)</label>
          <textarea
            id="announcement-message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            aria-invalid={errors.message ? "true" : "false"}
          ></textarea>
          {errors.message && (
            <span className="admin-error">{errors.message}</span>
          )}
        </div>

        <div className="admin-check">
          <input
            id="announcement-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="announcement-published">
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

      {/* Announcement list */}
      <div className="admin-table-wrap">
        {announcements.length === 0 ? (
          <p className="empty-state">No announcements yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(function (item) {
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
                          <span>Delete this announcement?</span>
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

export default Announcements;