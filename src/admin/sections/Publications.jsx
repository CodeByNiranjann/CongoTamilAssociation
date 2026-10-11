// src/admin/sections/Publications.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// TEMPORARY sample data (generic text, not official CTA content).
// Add, edit, delete and publish only change this page's memory for now.
// They are connected to the real backend API later.
// Cover image: for now you paste an image URL. Later this becomes a file upload to Cloudinary.
const startingPublications = [
  {
    _id: "p1",
    title: "Sample publication one",
    month: "3",
    year: "2026",
    description: "Sample description.",
    coverImageUrl: "",
    pdfLink: "",
    isPublished: true,
  },
  {
    _id: "p2",
    title: "Sample publication two",
    month: "8",
    year: "2026",
    description: "",
    coverImageUrl: "",
    pdfLink: "https://drive.google.com",
    isPublished: false,
  },
];

const emptyForm = {
  title: "",
  month: "",
  year: "",
  description: "",
  coverImageUrl: "",
  pdfLink: "",
  isPublished: true,
};

function formatMonthYear(month, year) {
  const monthNumber = Number(month);
  let monthText = "";

  if (monthNumber >= 1 && monthNumber <= 12) {
    monthText = monthNames[monthNumber - 1];
  }

  return (monthText + " " + year).trim();
}

function Publications() {
  const [publications, setPublications] = useState(startingPublications);
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

    if (formData.title.length > 150) {
      newErrors.title = "Title must be 150 characters or fewer.";
    }

    if (formData.month === "") {
      newErrors.month = "Choose a month.";
    }

    if (/^\d{4}$/.test(formData.year.trim()) === false) {
      newErrors.year = "Enter a 4-digit year, for example 2026.";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or fewer.";
    }

    const coverImageUrl = formData.coverImageUrl.trim();
    if (coverImageUrl !== "" && /^(https?:\/\/|\/)/.test(coverImageUrl) === false) {
      newErrors.coverImageUrl = "Enter a full link (https://...) or a path starting with /.";
    }

    const pdfLink = formData.pdfLink.trim();
    if (pdfLink !== "" && /^https?:\/\//.test(pdfLink) === false) {
      newErrors.pdfLink = "Enter a full link starting with https://";
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
      month: formData.month,
      year: formData.year.trim(),
      description: formData.description.trim(),
      coverImageUrl: formData.coverImageUrl.trim(),
      pdfLink: formData.pdfLink.trim(),
      isPublished: formData.isPublished,
    };

    if (editingId) {
      const updatedList = publications.map(function (item) {
        if (item._id === editingId) {
          return { ...item, ...cleanData };
        }
        return item;
      });
      setPublications(updatedList);
      setMessage("Publication updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setPublications([newItem, ...publications]);
      setMessage("Publication added.");
    }

    resetForm();
  }

  function startEdit(item) {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      month: String(item.month),
      year: String(item.year),
      description: item.description || "",
      coverImageUrl: item.coverImageUrl || "",
      pdfLink: item.pdfLink || "",
      isPublished: item.isPublished,
    });
    setErrors({});
    setMessage("");
    window.scrollTo(0, 0);
  }

  function togglePublished(id) {
    const updatedList = publications.map(function (item) {
      if (item._id === id) {
        return { ...item, isPublished: !item.isPublished };
      }
      return item;
    });
    setPublications(updatedList);
  }

  function confirmDelete(id) {
    const remaining = publications.filter(function (item) {
      return item._id !== id;
    });
    setPublications(remaining);
    setDeleteId("");
    setMessage("Publication deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Publication";
  let submitText = "Add Publication";
  if (editingId) {
    formTitle = "Edit Publication";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Publications / Books</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add / edit form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="pub-title">Title *</label>
            <input
              id="pub-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className="admin-error">{errors.title}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="pub-month">Month *</label>
            <select
              id="pub-month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              aria-invalid={errors.month ? "true" : "false"}
            >
              <option value="">Choose month</option>
              {monthNames.map(function (name, index) {
                return (
                  <option key={name} value={String(index + 1)}>
                    {name}
                  </option>
                );
              })}
            </select>
            {errors.month && <span className="admin-error">{errors.month}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="pub-year">Year *</label>
            <input
              id="pub-year"
              name="year"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="2026"
              value={formData.year}
              onChange={handleChange}
              aria-invalid={errors.year ? "true" : "false"}
            />
            {errors.year && <span className="admin-error">{errors.year}</span>}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="pub-description">Description</label>
          <textarea
            id="pub-description"
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
            <label htmlFor="pub-cover">Cover image link</label>
            <input
              id="pub-cover"
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
            <label htmlFor="pub-pdf">PDF / Google Drive link</label>
            <input
              id="pub-pdf"
              name="pdfLink"
              type="text"
              placeholder="https://drive.google.com/..."
              value={formData.pdfLink}
              onChange={handleChange}
              aria-invalid={errors.pdfLink ? "true" : "false"}
            />
            {errors.pdfLink && (
              <span className="admin-error">{errors.pdfLink}</span>
            )}
          </div>
        </div>

        <div className="admin-check">
          <input
            id="pub-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="pub-published">
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

      {/* Publication list */}
      <div className="admin-table-wrap">
        {publications.length === 0 ? (
          <p className="empty-state">No publications yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Month / Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publications.map(function (item) {
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
                    <td>{formatMonthYear(item.month, item.year)}</td>
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
                          <span>Delete this publication?</span>
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

export default Publications;