// src/admin/sections/Committee.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";

const emptyForm = {
  name: "",
  role: "",
  year: "",
  bio: "",
};

function Committee() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // Load the real list from the backend when the page opens
  useEffect(function loadMembers() {
    let isCancelled = false;

    async function fetchMembers() {
      try {
        const result = await apiGet("/committee");

        if (isCancelled === false) {
          setMembers(result.data);
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

    fetchMembers();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required.";
    }

    if (formData.role.trim() === "") {
      newErrors.role = "Role or designation is required.";
    }

    if (/^\d{4}$/.test(formData.year.trim()) === false) {
      newErrors.year = "Enter a 4-digit year, for example 2026.";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be 500 characters or fewer.";
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
      name: formData.name.trim(),
      role: formData.role.trim(),
      year: formData.year.trim(),
      bio: formData.bio.trim(),
    };

    setSaving(true);

    try {
      if (editingId) {
        const result = await apiPut("/committee/" + editingId, cleanData, true);

        setMembers(
          members.map(function (member) {
            if (member._id === editingId) {
              return result.data;
            }
            return member;
          })
        );
        setMessage("Committee member updated.");
      } else {
        const result = await apiPost("/committee", cleanData, true);

        setMembers([result.data, ...members]);
        setMessage("Committee member added.");
      }

      resetForm();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(member) {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      role: member.role,
      year: member.year,
      bio: member.bio || "",
    });
    setErrors({});
    setMessage("");
    setServerError("");
    window.scrollTo(0, 0);
  }

  async function confirmDelete(id) {
    setMessage("");
    setServerError("");

    try {
      await apiDelete("/committee/" + id, true);

      setMembers(
        members.filter(function (member) {
          return member._id !== id;
        })
      );
      setMessage("Committee member deleted.");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  let formTitle = "Add Committee Member";
  let submitText = "Add Member";
  if (editingId) {
    formTitle = "Edit Committee Member";
    submitText = "Save Changes";
  }

  if (saving) {
    submitText = "Saving...";
  }

  let listContent = null;

  if (loading) {
    listContent = <p className="loading-state">Loading committee members...</p>;
  } else if (loadError) {
    listContent = <p className="alert alert-error">{loadError}</p>;
  } else if (members.length === 0) {
    listContent = <p className="empty-state">No committee members yet.</p>;
  } else {
    listContent = (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(function (member) {
            const isDeleting = deleteId === member._id;

            return (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.year}</td>
                <td>
                  {isDeleting ? (
                    <div className="admin-confirm">
                      <span>Delete this member?</span>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={function () {
                          confirmDelete(member._id);
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
                        aria-label={"Edit " + member.name}
                        onClick={function () {
                          startEdit(member);
                        }}
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        aria-label={"Delete " + member.name}
                        onClick={function () {
                          setDeleteId(member._id);
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
      <h2 className="admin-section-title">Committee</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      {/* Add / edit form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="committee-name">Name *</label>
            <input
              id="committee-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <span className="admin-error">{errors.name}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="committee-role">Role / Designation *</label>
            <input
              id="committee-role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              aria-invalid={errors.role ? "true" : "false"}
            />
            {errors.role && <span className="admin-error">{errors.role}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="committee-year">Committee Year *</label>
            <input
              id="committee-year"
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
          <label htmlFor="committee-bio">Bio (optional)</label>
          <textarea
            id="committee-bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            aria-invalid={errors.bio ? "true" : "false"}
          ></textarea>
          {errors.bio && <span className="admin-error">{errors.bio}</span>}
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

      {/* Members list */}
      <div className="admin-table-wrap">{listContent}</div>
    </div>
  );
}

export default Committee;