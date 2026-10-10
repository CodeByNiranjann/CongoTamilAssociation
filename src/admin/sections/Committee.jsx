// src/admin/sections/Committee.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

// TEMPORARY sample data (placeholder names, not real CTA members).
// Add, edit and delete only change this page's memory for now.
// They are connected to the real backend API later.
const startingMembers = [
  {
    _id: "m1",
    name: "Sample Member One",
    role: "Sample Role",
    year: "2026",
    bio: "",
  },
  {
    _id: "m2",
    name: "Sample Member Two",
    role: "Sample Role",
    year: "2025",
    bio: "",
  },
];

const emptyForm = {
  name: "",
  role: "",
  year: "",
  bio: "",
};

function Committee() {
  const [members, setMembers] = useState(startingMembers);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

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

    if (editingId) {
      const updatedMembers = members.map(function (member) {
        if (member._id === editingId) {
          return { ...member, ...cleanData };
        }
        return member;
      });
      setMembers(updatedMembers);
      setMessage("Committee member updated.");
    } else {
      const newMember = { _id: "local-" + Date.now(), ...cleanData };
      setMembers([newMember, ...members]);
      setMessage("Committee member added.");
    }

    resetForm();
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
    window.scrollTo(0, 0);
  }

  function confirmDelete(id) {
    const remainingMembers = members.filter(function (member) {
      return member._id !== id;
    });
    setMembers(remainingMembers);
    setDeleteId("");
    setMessage("Committee member deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Committee Member";
  let submitText = "Add Member";
  if (editingId) {
    formTitle = "Edit Committee Member";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Committee</h2>

      {message && <div className="alert alert-success">{message}</div>}

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

      {/* Members list */}
      <div className="admin-table-wrap">
        {members.length === 0 ? (
          <p className="empty-state">No committee members yet.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default Committee;