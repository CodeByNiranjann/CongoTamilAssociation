// src/admin/sections/Anthem.jsx
import { useState } from "react";
import { Save } from "lucide-react";

// TEMPORARY starting values. I have not invented the anthem title, words, or audio.
// Saving only changes this page's memory for now.
// It is connected to the real backend API later.
// Audio: for now you paste an audio URL or a path such as /audio/anthem.mp3.
// Later this can become a file upload to Cloudinary.
const startingAnthem = {
  title: "CTA Anthem",
  description: "",
  audioUrl: "",
};

function Anthem() {
  const [savedAnthem, setSavedAnthem] = useState(startingAnthem);
  const [formData, setFormData] = useState(startingAnthem);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

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

    const audioUrl = formData.audioUrl.trim();
    if (audioUrl !== "" && /^(https?:\/\/|\/)/.test(audioUrl) === false) {
      newErrors.audioUrl = "Enter a full link (https://...) or a path starting with /.";
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
      title: formData.title.trim(),
      description: formData.description.trim(),
      audioUrl: formData.audioUrl.trim(),
    };

    setSavedAnthem(cleanData);
    setFormData(cleanData);
    setMessage("Anthem details saved.");
  }

  function handleReset() {
    setFormData(savedAnthem);
    setErrors({});
    setMessage("");
  }

  let preview = <p className="empty-state">No audio added yet.</p>;
  if (savedAnthem.audioUrl) {
    preview = (
      <audio controls src={savedAnthem.audioUrl} className="admin-audio">
        Your browser does not support audio playback.
      </audio>
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">CTA Anthem</h2>

      {message && <div className="alert alert-success">{message}</div>}

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

        <div className="admin-field">
          <label htmlFor="anthem-audio">Audio link</label>
          <input
            id="anthem-audio"
            name="audioUrl"
            type="text"
            placeholder="https://... or /audio/anthem.mp3"
            value={formData.audioUrl}
            onChange={handleChange}
            aria-invalid={errors.audioUrl ? "true" : "false"}
          />
          {errors.audioUrl && (
            <span className="admin-error">{errors.audioUrl}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Anthem
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Undo Changes
          </button>
        </div>
      </form>

      <div className="admin-form">
        <h3 className="admin-form-title">Saved Audio Preview</h3>
        {preview}
      </div>
    </div>
  );
}

export default Anthem;