// src/admin/sections/ContactInfo.jsx
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

// TEMPORARY starting values. I have not invented any contact details.
// Fill these in only with verified CTA information.
// Saving only changes this page's memory for now.
// It is connected to the real backend API later.
const startingContact = {
  email: "",
  phone: "",
  address: "",
  youtubeUrl: "",
};

const startingSocialLinks = [];

const emptySocialForm = {
  name: "",
  url: "",
};

function ContactInfo() {
  // ----- Contact details -----
  const [savedContact, setSavedContact] = useState(startingContact);
  const [formData, setFormData] = useState(startingContact);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // ----- Social media links -----
  const [socialLinks, setSocialLinks] = useState(startingSocialLinks);
  const [socialForm, setSocialForm] = useState(emptySocialForm);
  const [socialErrors, setSocialErrors] = useState({});
  const [socialMessage, setSocialMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // ----- Contact detail handlers -----
  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    const email = formData.email.trim();
    if (email !== "" && /^\S+@\S+\.\S+$/.test(email) === false) {
      newErrors.email = "Enter a valid email address.";
    }

    const phone = formData.phone.trim();
    if (phone !== "" && /^\+?[0-9\s-]{7,20}$/.test(phone) === false) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (formData.address.length > 300) {
      newErrors.address = "Address must be 300 characters or fewer.";
    }

    const youtubeUrl = formData.youtubeUrl.trim();
    if (youtubeUrl !== "" && /^https?:\/\//.test(youtubeUrl) === false) {
      newErrors.youtubeUrl = "Enter a full link starting with https://";
    }

    return newErrors;
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
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      youtubeUrl: formData.youtubeUrl.trim(),
    };

    setSavedContact(cleanData);
    setFormData(cleanData);
    setMessage("Contact information saved.");
  }

  function handleUndo() {
    setFormData(savedContact);
    setErrors({});
    setMessage("");
  }

  // ----- Social link handlers -----
  function handleSocialChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setSocialForm({ ...socialForm, [fieldName]: fieldValue });
  }

  function handleSocialSubmit(event) {
    event.preventDefault();
    setSocialMessage("");

    const newErrors = {};

    if (socialForm.name.trim() === "") {
      newErrors.name = "Name is required, for example Facebook.";
    }

    const url = socialForm.url.trim();
    if (url === "") {
      newErrors.url = "Link is required.";
    } else if (/^https?:\/\//.test(url) === false) {
      newErrors.url = "Enter a full link starting with https://";
    }

    setSocialErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const newLink = {
      _id: "local-" + Date.now(),
      name: socialForm.name.trim(),
      url: url,
    };

    setSocialLinks([...socialLinks, newLink]);
    setSocialForm(emptySocialForm);
    setSocialMessage("Social link added.");
  }

  function confirmDelete(id) {
    setSocialLinks(
      socialLinks.filter(function (item) {
        return item._id !== id;
      })
    );
    setDeleteId("");
    setSocialMessage("Social link deleted.");
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Contact Information</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">Official Details</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="ci-email">Official email</label>
            <input
              id="ci-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <span className="admin-error">{errors.email}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="ci-phone">Phone number</label>
            <input
              id="ci-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && <span className="admin-error">{errors.phone}</span>}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="ci-address">Address</label>
          <textarea
            id="ci-address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            aria-invalid={errors.address ? "true" : "false"}
          ></textarea>
          {errors.address && (
            <span className="admin-error">{errors.address}</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="ci-youtube">Official CTA YouTube link</label>
          <input
            id="ci-youtube"
            name="youtubeUrl"
            type="text"
            placeholder="https://www.youtube.com/..."
            value={formData.youtubeUrl}
            onChange={handleChange}
            aria-invalid={errors.youtubeUrl ? "true" : "false"}
          />
          {errors.youtubeUrl && (
            <span className="admin-error">{errors.youtubeUrl}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Contact Information
          </button>
          <button type="button" className="btn btn-outline" onClick={handleUndo}>
            Undo Changes
          </button>
        </div>
      </form>

      {/* Social media links */}
      <h2 className="admin-section-title admin-section-gap">Social Media Links</h2>

      {socialMessage && (
        <div className="alert alert-success">{socialMessage}</div>
      )}

      <form className="admin-form" onSubmit={handleSocialSubmit} noValidate>
        <h3 className="admin-form-title">Add Social Link</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="cis-name">Name *</label>
            <input
              id="cis-name"
              name="name"
              type="text"
              placeholder="Facebook"
              value={socialForm.name}
              onChange={handleSocialChange}
              aria-invalid={socialErrors.name ? "true" : "false"}
            />
            {socialErrors.name && (
              <span className="admin-error">{socialErrors.name}</span>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="cis-url">Link *</label>
            <input
              id="cis-url"
              name="url"
              type="text"
              placeholder="https://..."
              value={socialForm.url}
              onChange={handleSocialChange}
              aria-invalid={socialErrors.url ? "true" : "false"}
            />
            {socialErrors.url && (
              <span className="admin-error">{socialErrors.url}</span>
            )}
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Add Link
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        {socialLinks.length === 0 ? (
          <p className="empty-state">No social links yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {socialLinks.map(function (item) {
                const isDeleting = deleteId === item._id;

                return (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.url}</td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this link?</span>
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
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          aria-label={"Delete " + item.name}
                          onClick={function () {
                            setDeleteId(item._id);
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
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

export default ContactInfo;