// src/admin/sections/Announcements.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";

// Which part of the website the announcements belong to
const sectionOptions = [
  { value: "home", label: "Home page" },
  { value: "tamil-school", label: "Tamil School" },
  { value: "africa-tamil-charal", label: "Africa Tamil Charal" },
];

const emptyForm = {
  title: "",
  message: "",
  date: "",
  isPublished: true,
};

// The backend sends dates like "2026-10-10T00:00:00.000Z". The date input and
// the table only need "2026-10-10".
function toDateText(dateValue) {
  if (!dateValue) {
    return "";
  }
  return String(dateValue).slice(0, 10);
}

function Announcements() {
  const [section, setSection] = useState("home");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // Load all announcements (including drafts) for the chosen section
  useEffect(
    function loadAnnouncements() {
      let isCancelled = false;

      async function fetchAnnouncements() {
        setLoading(true);
        setLoadError("");

        try {
          const result = await apiGet(
            "/announcements/admin?section=" + section,
            true
          );

          if (isCancelled === false) {
            setAnnouncements(result.data);
          }
        } catch (err) {
          if (isCancelled === false) {
            setLoadError(err.message);
          }
        } finally {
          if (isCancelled === false) {
            setLoading(false);
          }
        }
      }

      fetchAnnouncements();

      return function cleanup() {
        isCancelled = true;
      };
    },
    [section]
  );

  function handleSectionChange(event) {
    setSection(event.target.value);
    setFormData(emptyForm);
    setEditingId("");
    setErrors({});
    setMessage("");
    setServerError("");
    setDeleteId("");
  }

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

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setServerError("");

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cleanData = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      date: formData.date,
      section: section,
      isPublished: formData.isPublished,
    };

    setSaving(true);

    try {
      if (editingId) {
        const result = await apiPut(
          "/announcements/" + editingId,
          cleanData,
          true
        );

        setAnnouncements(
          announcements.map(function (item) {
            if (item._id === editingId) {
              return result.data;
            }
            return item;
          })
        );
        setMessage("Announcement updated.");
      } else {
        const result = await apiPost("/announcements", cleanData, true);

        setAnnouncements([result.data, ...announcements]);
        setMessage("Announcement added.");
      }

      resetForm();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      message: item.message || "",
      date: toDateText(item.date),
      isPublished: item.isPublished,
    });
    setErrors({});
    setMessage("");
    setServerError("");
    window.scrollTo(0, 0);
  }

  async function togglePublished(item) {
    setMessage("");
    setServerError("");

    try {
      const result = await apiPut(
        "/announcements/" + item._id,
        { isPublished: !item.isPublished },
        true
      );

      setAnnouncements(
        announcements.map(function (current) {
          if (current._id === item._id) {
            return result.data;
          }
          return current;
        })
      );
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function confirmDelete(id) {
    setMessage("");
    setServerError("");

    try {
      await apiDelete("/announcements/" + id, true);

      setAnnouncements(
        announcements.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("Announcement deleted.");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  let formTitle = "Add Announcement";
  let submitText = "Add Announcement";
  if (editingId) {
    formTitle = "Edit Announcement";
    submitText = "Save Changes";
  }

  if (saving) {
    submitText = "Saving...";
  }

  let listContent = null;

  if (loading) {
    listContent = <p className="loading-state">Loading announcements...</p>;
  } else if (loadError) {
    listContent = <p className="alert alert-error">{loadError}</p>;
  } else if (announcements.length === 0) {
    listContent = <p className="empty-state">No announcements yet.</p>;
  } else {
    listContent = (
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
                <td>{toDateText(item.date)}</td>
                <td>
                  <button
                    type="button"
                    className={statusClass}
                    aria-label={"Toggle published for " + item.title}
                    onClick={function () {
                      togglePublished(item);
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
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Announcements</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="admin-filter">
        <label htmlFor="announcement-section">Show announcements for</label>
        <select
          id="announcement-section"
          value={section}
          onChange={handleSectionChange}
        >
          {sectionOptions.map(function (option) {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </div>

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
          <button type="submit" className="btn btn-primary" disabled={saving}>
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
      <div className="admin-table-wrap">{listContent}</div>
    </div>
  );
}

export default Announcements;