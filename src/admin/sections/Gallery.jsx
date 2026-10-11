// src/admin/sections/Gallery.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

// TEMPORARY sample data (generic text, not official CTA content).
// Add, edit, delete and publish only change this page's memory for now.
// They are connected to the real backend API later.
// Cover image: for now you paste an image URL. Later this becomes a file upload to Cloudinary.
const startingGalleries = [
  {
    _id: "g1",
    title: "Sample album one",
    date: "2026-06-10",
    description: "Sample description.",
    coverImageUrl: "",
    albumLink: "",
    isPublished: true,
  },
  {
    _id: "g2",
    title: "Sample album two",
    date: "2026-08-22",
    description: "",
    coverImageUrl: "",
    albumLink: "https://drive.google.com",
    isPublished: false,
  },
];

const emptyForm = {
  title: "",
  date: "",
  description: "",
  coverImageUrl: "",
  albumLink: "",
  isPublished: true,
};

function Gallery() {
  const [galleries, setGalleries] = useState(startingGalleries);
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

    const coverImageUrl = formData.coverImageUrl.trim();
    if (coverImageUrl !== "" && /^(https?:\/\/|\/)/.test(coverImageUrl) === false) {
      newErrors.coverImageUrl = "Enter a full link (https://...) or a path starting with /.";
    }

    const albumLink = formData.albumLink.trim();
    if (albumLink === "") {
      newErrors.albumLink = "Google Drive album link is required.";
    } else if (/^https?:\/\//.test(albumLink) === false) {
      newErrors.albumLink = "Enter a full link starting with https://";
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
      description: formData.description.trim(),
      coverImageUrl: formData.coverImageUrl.trim(),
      albumLink: formData.albumLink.trim(),
      isPublished: formData.isPublished,
    };

    if (editingId) {
      const updatedList = galleries.map(function (item) {
        if (item._id === editingId) {
          return { ...item, ...cleanData };
        }
        return item;
      });
      setGalleries(updatedList);
      setMessage("Album updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setGalleries([newItem, ...galleries]);
      setMessage("Album added.");
    }

    resetForm();
  }

  function startEdit(item) {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      date: item.date,
      description: item.description || "",
      coverImageUrl: item.coverImageUrl || "",
      albumLink: item.albumLink || "",
      isPublished: item.isPublished,
    });
    setErrors({});
    setMessage("");
    window.scrollTo(0, 0);
  }

  function togglePublished(id) {
    const updatedList = galleries.map(function (item) {
      if (item._id === id) {
        return { ...item, isPublished: !item.isPublished };
      }
      return item;
    });
    setGalleries(updatedList);
  }

  function confirmDelete(id) {
    const remaining = galleries.filter(function (item) {
      return item._id !== id;
    });
    setGalleries(remaining);
    setDeleteId("");
    setMessage("Album deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Album";
  let submitText = "Add Album";
  if (editingId) {
    formTitle = "Edit Album";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Gallery</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add / edit form */}
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

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="gallery-cover">Cover image link</label>
            <input
              id="gallery-cover"
              name="coverImageUrl"
              type="text"
              placeholder="https://... or /images/cover.jpg"
              value={formData.coverImageUrl}
              onChange={handleChange}
              aria-invalid={errors.coverImageUrl ? "true" : "false"}
            />
            {errors.coverImageUrl && (
              <span className="admin-error">{errors.coverImageUrl}</span>
            )}
          </div>

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
        </div>

        <div className="admin-check">
          <input
            id="gallery-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="gallery-published">
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

      {/* Album list */}
      <div className="admin-table-wrap">
        {galleries.length === 0 ? (
          <p className="empty-state">No albums yet.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default Gallery;