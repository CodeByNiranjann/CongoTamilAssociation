// src/admin/sections/Anthem.jsx
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

import { apiGet, apiPut } from "../../api.js";
import UploadField from "../UploadField.jsx";

const emptyAnthem = {
  title: "CTA Anthem",
  description: "",
  audioUrl: "",
};

function Anthem() {
  const [savedAnthem, setSavedAnthem] = useState(emptyAnthem);
  const [formData, setFormData] = useState(emptyAnthem);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(function loadAnthem() {
    let isCancelled = false;

    async function fetchAnthem() {
      try {
        const result = await apiGet("/anthem");
        const loaded = {
          title: result.data.title || "CTA Anthem",
          description: result.data.description || "",
          audioUrl: result.data.audioUrl || "",
        };

        if (isCancelled === false) {
          setSavedAnthem(loaded);
          setFormData(loaded);
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

    fetchAnthem();

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

    if (formData.title.trim() === "") {
      newErrors.title = "Anthem title is required.";
    }

    if (formData.title.length > 120) {
      newErrors.title = "Title must be 120 characters or fewer.";
    }

    if (formData.description.length > 3000) {
      newErrors.description = "Description must be 3000 characters or fewer.";
    }

    const audio = formData.audioUrl.trim();
    if (audio !== "" && /^(https?:\/\/|\/)/.test(audio) === false) {
      newErrors.audioUrl = "Enter a full link (https://...) or upload an audio file.";
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
      const result = await apiPut(
        "/anthem",
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          audioUrl: formData.audioUrl.trim(),
        },
        true
      );

      const saved = {
        title: result.data.title,
        description: result.data.description || "",
        audioUrl: result.data.audioUrl || "",
      };
      setSavedAnthem(saved);
      setFormData(saved);
      setMessage("Anthem details saved.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setFormData(savedAnthem);
    setErrors({});
    setMessage("");
    setServerError("");
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p className="loading-state">Loading anthem...</p>
      </div>
    );
  }

  let buttonText = "Save Anthem";
  if (saving) {
    buttonText = "Saving...";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">CTA Anthem</h2>

      {loadError && <div className="alert alert-error">{loadError}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">Anthem Details</h3>

        <div className="admin-field">
          <label htmlFor="anthem-title">Title *</label>
          <input
            id="anthem-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            aria-invalid={errors.title ? "true" : "false"}
          />
          {errors.title && <span className="admin-error">{errors.title}</span>}
        </div>

        <div className="admin-field">
          <label htmlFor="anthem-description">Description</label>
          <textarea
            id="anthem-description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            aria-invalid={errors.description ? "true" : "false"}
          ></textarea>
          {errors.description && (
            <span className="admin-error">{errors.description}</span>
          )}
        </div>

        <UploadField
          id="anthem-audio"
          label="Anthem audio (MP3 or WAV)"
          kind="audio"
          value={formData.audioUrl}
          onChange={function (url) {
            setFormData({ ...formData, audioUrl: url });
          }}
          error={errors.audioUrl}
        />

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {buttonText}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Undo Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Anthem;