// src/pages/JoinCTA.jsx
import { useState } from "react";
import { Send, Users } from "lucide-react";

import Notification from "../components/Notification.jsx";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
};

function JoinCTAPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "info", message: "" });

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

    if (/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim()) === false) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (/^\S+@\S+\.\S+$/.test(formData.email.trim()) === false) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.company.trim() === "") {
      newErrors.company = "Company is required.";
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

    // Backend is not connected yet, so nothing is saved or emailed.
    // Later: send formData to the join enquiry API here.
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
    return <span className="form-error">{errors[name]}</span>;
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
          <h1 className="page-header-title">Join CTA</h1>
          <p className="page-header-text">
            Send us your details and we will get in touch with you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form
            className="public-form join-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <span className="about-icon about-icon-center" aria-hidden="true">
              <Users size={28} />
            </span>
            <h2 className="contact-form-title text-center">
              Membership Enquiry
            </h2>

            <Notification
              type={notice.type}
              message={notice.message}
              onClose={clearNotice}
            />

            <div className="form-field">
              <label htmlFor="jn-name">Name *</label>
              <input
                id="jn-name"
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
              <label htmlFor="jn-phone">Phone *</label>
              <input
                id="jn-phone"
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
              <label htmlFor="jn-email">Email *</label>
              <input
                id="jn-email"
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
              <label htmlFor="jn-company">Company *</label>
              <input
                id="jn-company"
                name="company"
                type="text"
                autoComplete="organization"
                value={formData.company}
                onChange={handleChange}
                aria-invalid={invalid("company")}
              />
              {renderError("company")}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Send size={18} /> Submit Enquiry
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default JoinCTAPage;