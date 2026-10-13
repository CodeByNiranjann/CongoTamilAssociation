// src/admin/sections/ContactInfo.jsx
import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

import { apiGet, apiPut } from "../../api.js";

const emptyContact = {
  email: "",
  phone: "",
  address: "",
  youtubeUrl: "",
};

const emptySocialForm = {
  name: "",
  url: "",
};

function ContactInfo() {
  const [formData, setFormData] = useState(emptyContact);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const [socialForm, setSocialForm] = useState(emptySocialForm);
  const [socialErrors, setSocialErrors] = useState({});

  useEffect(function loadContact() {
    let isCancelled = false;

    async function fetchContact() {
      try {
        const result = await apiGet("/contact");

        if (isCancelled === false) {
          setFormData({
            email: result.data.email || "",
            phone: result.data.phone || "",
            address: result.data.address || "",
            youtubeUrl: result.data.youtubeUrl || "",
          });
          setSocialLinks(
            (result.data.socialLinks || []).map(function (item) {
              return { name: item.name, url: item.url };
            })
          );
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

    fetchContact();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function handleSocialChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setSocialForm({ ...socialForm, [fieldName]: fieldValue });
  }

  function addSocialLink(event) {
    event.preventDefault();
    setMessage("");

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

    setSocialLinks([...socialLinks, { name: socialForm.name.trim(), url: url }]);
    setSocialForm(emptySocialForm);
    setMessage("Link added to the list. Click Save Contact Information to keep it.");
  }

  function removeSocialLink(index) {
    setSocialLinks(
      socialLinks.filter(function (item, itemIndex) {
        return itemIndex !== index;
      })
    );
    setMessage("Link removed from the list. Click Save Contact Information to keep it.");
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

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setServerError("");

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      await apiPut(
        "/contact",
        {
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          youtubeUrl: formData.youtubeUrl.trim(),
          socialLinks: socialLinks,
        },
        true
      );
      setMessage("Contact information saved.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p className="loading-state">Loading contact information...</p>
      </div>
    );
  }

  let buttonText = "Save Contact Information";
  if (saving) {
    buttonText = "Saving...";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Contact Information</h2>

      {loadError && <div className="alert alert-error">{loadError}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

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
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {buttonText}
          </button>
        </div>
      </form>

      <h2 className="admin-section-title admin-section-gap">Social Media Links</h2>

      <form className="admin-form" onSubmit={addSocialLink} noValidate>
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
          <button type="submit" className="btn btn-outline">
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
              {socialLinks.map(function (item, index) {
                return (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.url}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        aria-label={"Remove " + item.name}
                        onClick={function () {
                          removeSocialLink(index);
                        }}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
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