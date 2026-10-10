// src/pages/JobSeeking.jsx
import { useState } from "react";
import { Send, Upload } from "lucide-react";

import Notification from "../components/Notification.jsx";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
  jobTitle: "",
  skills: "",
  experience: "",
  location: "",
};

function getFileExtension(fileName) {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1].toLowerCase();
}

function JobSeeking() {
  const [formData, setFormData] = useState(emptyForm);
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "info", message: "" });

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setCvFile(null);
      return;
    }

    const extension = getFileExtension(file.name);

    if (ALLOWED_EXTENSIONS.includes(extension) === false) {
      setCvFile(null);
      event.target.value = "";
      setErrors({ ...errors, cv: "Please choose a PDF, DOC or DOCX file." });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setCvFile(null);
      event.target.value = "";
      setErrors({
        ...errors,
        cv: "The file must be " + MAX_FILE_SIZE_MB + " MB or smaller.",
      });
      return;
    }

    setCvFile(file);
    setErrors({ ...errors, cv: "" });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required.";
    }

    if (/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim()) === false) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (/^\S+@\S+\.\S+$/.test(formData.email.trim()) === false) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.jobTitle.trim() === "") {
      newErrors.jobTitle = "Job title is required.";
    }

    if (formData.skills.trim() === "") {
      newErrors.skills = "Please list your skills.";
    }

    const years = Number(formData.experience);
    if (formData.experience === "" || isNaN(years) || years < 0 || years > 60) {
      newErrors.experience = "Enter years of experience (0 to 60).";
    }

    if (formData.location.trim() === "") {
      newErrors.location = "Preferred location is required.";
    }

    if (!cvFile) {
      newErrors.cv = "Please upload your CV (PDF, DOC or DOCX).";
    }

    return newErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "info", message: "" });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setNotice({
        type: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    // Backend is not connected yet, so nothing is sent or saved.
    // Later: send formData and cvFile with FormData to the API here.
    setSubmitting(true);
    setNotice({
      type: "info",
      message:
        "Form is valid. It is not saved yet because the backend is not connected.",
    });
    setSubmitting(false);
  }

  function clearNotice() {
    setNotice({ type: "info", message: "" });
  }

  function renderError(name) {
    if (!errors[name]) {
      return null;
    }
    return (
      <span className="form-error" id={"error-" + name}>
        {errors[name]}
      </span>
    );
  }

  function invalid(name) {
    if (errors[name]) {
      return "true";
    }
    return "false";
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Job Seeking</h1>
          <p className="page-header-text">
            Share your details and CV with the CTA community.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form className="public-form" onSubmit={handleSubmit} noValidate>
            <Notification
              type={notice.type}
              message={notice.message}
              onClose={clearNotice}
            />

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="js-name">Applicant name *</label>
                <input
                  id="js-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={invalid("name")}
                />
                {renderError("name")}
              </div>

              <div className="form-field">
                <label htmlFor="js-phone">Phone number *</label>
                <input
                  id="js-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-invalid={invalid("phone")}
                />
                {renderError("phone")}
              </div>

              <div className="form-field">
                <label htmlFor="js-email">Email address *</label>
                <input
                  id="js-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={invalid("email")}
                />
                {renderError("email")}
              </div>

              <div className="form-field">
                <label htmlFor="js-company">Current company</label>
                <input
                  id="js-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="js-jobTitle">Job title *</label>
                <input
                  id="js-jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  aria-invalid={invalid("jobTitle")}
                />
                {renderError("jobTitle")}
              </div>

              <div className="form-field">
                <label htmlFor="js-experience">Years of experience *</label>
                <input
                  id="js-experience"
                  name="experience"
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experience}
                  onChange={handleChange}
                  aria-invalid={invalid("experience")}
                />
                {renderError("experience")}
              </div>

              <div className="form-field">
                <label htmlFor="js-location">Preferred location *</label>
                <input
                  id="js-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  aria-invalid={invalid("location")}
                />
                {renderError("location")}
              </div>

              <div className="form-field">
                <label htmlFor="js-cv">
                  <Upload size={14} /> CV / Resume * (PDF, DOC, DOCX, max{" "}
                  {MAX_FILE_SIZE_MB} MB)
                </label>
                <input
                  id="js-cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  aria-invalid={invalid("cv")}
                />
                {renderError("cv")}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="js-skills">Skills *</label>
              <textarea
                id="js-skills"
                name="skills"
                rows={4}
                value={formData.skills}
                onChange={handleChange}
                aria-invalid={invalid("skills")}
              ></textarea>
              {renderError("skills")}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Send size={18} /> Submit Application
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default JobSeeking;