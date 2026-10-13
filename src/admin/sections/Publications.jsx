// src/admin/sections/Publications.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import UploadField from "../UploadField.jsx";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const sectionOptions = [
  { value: "general", label: "Publications page" },
  { value: "africa-tamil-charal", label: "Africa Tamil Charal page" },
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
  const [section, setSection] = useState("general");
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [deleteId, setDeleteId] = useState("");

  useEffect(
    function loadPublications() {
      let isCancelled = false;

      async function fetchPublications() {
        setLoading(true);
        setLoadError("");

        try {
          const result = await apiGet(
            "/publications/admin?section=" + section,
            true
          );
          if (isCancelled === false) {
            setPublications(result.data);
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

      fetchPublications();

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

    const cover = formData.coverImageUrl.trim();
    if (cover !== "" && /^(https?:\/\/|\/)/.test(cover) === false) {
      newErrors.coverImageUrl = "Enter a full link (https://...) or upload an image.";
    }

    const pdf = formData.pdfLink.trim();
    if (pdf !== "" && /^https?:\/\//.test(pdf) === false) {
      newErrors.pdfLink = "Enter a full link starting with https://";
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
      month: formData.month,
      year: formData.year.trim(),
      description: formData.description.trim(),
      coverImageUrl: formData.coverImageUrl.trim(),
      pdfLink: formData.pdfLink.trim(),
      section: section,
      isPublished: formData.isPublished,
    };

    setSaving(true);

    try {
      if (editingId) {
        const result = await apiPut("/publications/" + editingId, cleanData, true);
        setPublications(
          publications.map(function (item) {
            if (item._id === editingId) {
              return result.data;
            }
            return item;
          })
        );
        setMessage("Publication updated.");
      } else {
        const result = await apiPost("/publications", cleanData, true);
        setPublications([result.data, ...publications]);
        setMessage("Publication added.");
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
      month: String(item.month),
      year: String(item.year),
      description: item.description || "",
      coverImageUrl: item.coverImageUrl || "",
      pdfLink: item.pdfLink || "",
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
        "/publications/" + item._id,
        { isPublished: !item.isPublished },
        true
      );
      setPublications(
        publications.map(function (current) {
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
      await apiDelete("/publications/" + id, true);
      setPublications(
        publications.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("Publication deleted.");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  let formTitle = "Add Publication";
  let submitText = "Add Publication";
  if (editingId) {
    formTitle = "Edit Publication";
    submitText = "Save Changes";
  }
  if (saving) {
    submitText = "Saving...";
  }

  let listContent = null;

  if (loading) {
    listContent = <p className="loading-state">Loading publications...</p>;
  } else if (loadError) {
    listContent = <p className="alert alert-error">{loadError}</p>;
  } else if (publications.length === 0) {
    listContent = <p className="empty-state">No publications yet.</p>;
  } else {
    listContent = (
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
                      togglePublished(item);
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
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Publications / Books</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="admin-filter">
        <label htmlFor="pub-section">Manage publications for</label>
        <select id="pub-section" value={section} onChange={handleSectionChange}>
          {sectionOptions.map(function (option) {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </div>

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

        <UploadField
          id="pub-cover"
          label="Cover image"
          kind="image"
          value={formData.coverImageUrl}
          onChange={function (url) {
            setFormData({ ...formData, coverImageUrl: url });
          }}
          error={errors.coverImageUrl}
        />

        <UploadField
          id="pub-pdf"
          label="PDF file or Google Drive link"
          kind="pdf"
          value={formData.pdfLink}
          onChange={function (url) {
            setFormData({ ...formData, pdfLink: url });
          }}
          error={errors.pdfLink}
        />

        <div className="admin-check">
          <input
            id="pub-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="pub-published">Published (visible on the website)</label>
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

export default Publications;