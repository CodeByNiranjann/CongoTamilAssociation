// src/admin/sections/Gallery.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import UploadField from "../UploadField.jsx";

const emptyForm = {
  title: "",
  date: "",
  description: "",
  coverImageUrl: "",
  albumLink: "",
  isPublished: true,
};

function toDateText(dateValue) {
  if (!dateValue) {
    return "";
  }
  return String(dateValue).slice(0, 10);
}

function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [deleteId, setDeleteId] = useState("");

  useEffect(function loadGalleries() {
    let isCancelled = false;

    async function fetchGalleries() {
      try {
        const result = await apiGet("/gallery/admin", true);
        if (isCancelled === false) {
          setGalleries(result.data);
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

    fetchGalleries();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

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

    const cover = formData.coverImageUrl.trim();
    if (cover !== "" && /^(https?:\/\/|\/)/.test(cover) === false) {
      newErrors.coverImageUrl = "Enter a full link (https://...) or upload an image.";
    }

    const album = formData.albumLink.trim();
    if (album === "") {
      newErrors.albumLink = "Google Drive album link is required.";
    } else if (/^https?:\/\//.test(album) === false) {
      newErrors.albumLink = "Enter a full link starting with https://";
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
      date: formData.date,
      description: formData.description.trim(),
      coverImageUrl: formData.coverImageUrl.trim(),
      albumLink: formData.albumLink.trim(),
      isPublished: formData.isPublished,
    };

    setSaving(true);

    try {
      if (editingId) {
        const result = await apiPut("/gallery/" + editingId, cleanData, true);
        setGalleries(
          galleries.map(function (item) {
            if (item._id === editingId) {
              return result.data;
            }
            return item;
          })
        );
        setMessage("Album updated.");
      } else {
        const result = await apiPost("/gallery", cleanData, true);
        setGalleries([result.data, ...galleries]);
        setMessage("Album added.");
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
      date: toDateText(item.date),
      description: item.description || "",
      coverImageUrl: item.coverImageUrl || "",
      albumLink: item.albumLink || "",
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
        "/gallery/" + item._id,
        { isPublished: !item.isPublished },
        true
      );
      setGalleries(
        galleries.map(function (current) {
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
      await apiDelete("/gallery/" + id, true);
      setGalleries(
        galleries.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("Album deleted.");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  let formTitle = "Add Album";
  let submitText = "Add Album";
  if (editingId) {
    formTitle = "Edit Album";
    submitText = "Save Changes";
  }
  if (saving) {
    submitText = "Saving...";
  }

  let listContent = null;

  if (loading) {
    listContent = <p className="loading-state">Loading albums...</p>;
  } else if (loadError) {
    listContent = <p className="alert alert-error">{loadError}</p>;
  } else if (galleries.length === 0) {
    listContent = <p className="empty-state">No albums yet.</p>;
  } else {
    listContent = (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Album</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {galleries.map(function (item) {
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
                      <span>Delete this album?</span>
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
      <h2 className="admin-section-title">Gallery</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="gallery-title">Event name *</label>
            <input
              id="gallery-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className="admin-error">{errors.title}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="gallery-date">Date *</label>
            <input
              id="gallery-date"
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
          <label htmlFor="gallery-description">Description</label>
          <textarea
            id="gallery-description"
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

        <UploadField
          id="gallery-cover"
          label="Cover image"
          kind="image"
          value={formData.coverImageUrl}
          onChange={function (url) {
            setFormData({ ...formData, coverImageUrl: url });
          }}
          error={errors.coverImageUrl}
        />

        <div className="admin-field">
          <label htmlFor="gallery-album">Google Drive album link *</label>
          <input
            id="gallery-album"
            name="albumLink"
            type="text"
            placeholder="https://drive.google.com/..."
            value={formData.albumLink}
            onChange={handleChange}
            aria-invalid={errors.albumLink ? "true" : "false"}
          />
          {errors.albumLink && (
            <span className="admin-error">{errors.albumLink}</span>
          )}
        </div>

        <div className="admin-check">
          <input
            id="gallery-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="gallery-published">Published (visible on the website)</label>
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

      <div className="admin-table-wrap">{listContent}</div>
    </div>
  );
}

export default Gallery;