// src/admin/sections/ByLaws.jsx
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";

import { apiGet, apiPut, apiDelete } from "../../api.js";
import UploadField from "../UploadField.jsx";

const emptySectionForm = {
  heading: "",
  text: "",
};

function ByLaws() {
  const [intro, setIntro] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [infoErrors, setInfoErrors] = useState({});

  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [sectionErrors, setSectionErrors] = useState({});

  // Individual rule: show confirm row in table (local state only — must Save to persist)
  const [deleteIndex, setDeleteIndex] = useState(-1);
  // Whole record: show confirm UI next to Save button
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);

  useEffect(function loadByLaws() {
    let isCancelled = false;

    async function fetchByLaws() {
      try {
        const result = await apiGet("/by-laws");

        if (isCancelled === false) {
          setIntro(result.data.intro || "");
          setPdfUrl(result.data.pdfUrl || "");
          setSections(
            (result.data.sections || []).map(function (item) {
              return { heading: item.heading, text: item.text };
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

    fetchByLaws();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function handleSectionChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setSectionForm({ ...sectionForm, [fieldName]: fieldValue });
  }

  function resetSectionForm() {
    setSectionForm(emptySectionForm);
    setEditingIndex(-1);
    setSectionErrors({});
  }

  // Adds or updates a rule in the list below (saved with the Save button)
  function handleSectionSubmit(event) {
    event.preventDefault();
    setMessage("");

    const newErrors = {};

    if (sectionForm.heading.trim() === "") {
      newErrors.heading = "Heading is required.";
    }

    if (sectionForm.heading.length > 150) {
      newErrors.heading = "Heading must be 150 characters or fewer.";
    }

    if (sectionForm.text.trim() === "") {
      newErrors.text = "Rule text is required.";
    }

    if (sectionForm.text.length > 5000) {
      newErrors.text = "Rule text must be 5000 characters or fewer.";
    }

    setSectionErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cleanItem = {
      heading: sectionForm.heading.trim(),
      text: sectionForm.text.trim(),
    };

    if (editingIndex >= 0) {
      setSections(
        sections.map(function (item, index) {
          if (index === editingIndex) {
            return cleanItem;
          }
          return item;
        })
      );
    } else {
      setSections([...sections, cleanItem]);
    }

    resetSectionForm();
    setMessage("Rule list changed. Click Save By-Laws to keep your changes.");
  }

  function startEdit(index) {
    setEditingIndex(index);
    setSectionForm({
      heading: sections[index].heading,
      text: sections[index].text,
    });
    setSectionErrors({});
  }

  function moveSection(index, direction) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= sections.length) {
      return;
    }

    const copy = sections.slice();
    const moved = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = moved;
    setSections(copy);
    setMessage("Rule list changed. Click Save By-Laws to keep your changes.");
  }

  // Removes a single rule from local state only.
  // Nothing is sent to the server until the admin clicks "Save By-Laws".
  function confirmDeleteRule(index) {
    setSections(
      sections.filter(function (item, itemIndex) {
        return itemIndex !== index;
      })
    );
    setDeleteIndex(-1);
    resetSectionForm();
    setMessage("Rule removed. Click Save By-Laws to persist this change.");
  }

  // Permanently deletes the entire By-Laws record from MongoDB via DELETE /api/v1/by-laws.
  // After this the public page returns the empty-defaults response from getByLaws.
  async function handleDeleteAll() {
    setMessage("");
    setServerError("");
    setDeleting(true);

    try {
      await apiDelete("/by-laws", true);

      // Reset all local state to match the now-empty server record
      setIntro("");
      setPdfUrl("");
      setSections([]);
      resetSectionForm();
      setConfirmingDeleteAll(false);
      setMessage("By-laws deleted successfully.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    setMessage("");
    setServerError("");

    const newErrors = {};

    if (intro.length > 2000) {
      newErrors.intro = "Introduction must be 2000 characters or fewer.";
    }

    const cleanPdf = pdfUrl.trim();
    if (cleanPdf !== "" && /^(https?:\/\/|\/)/.test(cleanPdf) === false) {
      newErrors.pdfUrl = "Enter a full link (https://...) or upload a PDF.";
    }

    setInfoErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const result = await apiPut(
        "/by-laws",
        { intro: intro.trim(), pdfUrl: cleanPdf, sections: sections },
        true
      );

      // Sync all fields back from server (server may trim / clean values)
      setIntro(result.data.intro || "");
      setPdfUrl(result.data.pdfUrl || "");
      setSections(
        result.data.sections.map(function (item) {
          return { heading: item.heading, text: item.text };
        })
      );
      setMessage("By-laws saved.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p className="loading-state">Loading by-laws...</p>
      </div>
    );
  }

  let sectionFormTitle = "Add Rule";
  let sectionSubmitText = "Add Rule";
  if (editingIndex >= 0) {
    sectionFormTitle = "Edit Rule";
    sectionSubmitText = "Update Rule";
  }

  let saveText = "Save By-Laws";
  if (saving) {
    saveText = "Saving...";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">By-Laws</h2>

      {loadError && <div className="alert alert-error">{loadError}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="admin-form">
        <h3 className="admin-form-title">Introduction and PDF</h3>

        <div className="admin-field">
          <label htmlFor="bl-intro">Introduction (optional)</label>
          <textarea
            id="bl-intro"
            rows={4}
            value={intro}
            onChange={function (event) {
              setIntro(event.target.value);
            }}
            aria-invalid={infoErrors.intro ? "true" : "false"}
          ></textarea>
          {infoErrors.intro && (
            <span className="admin-error">{infoErrors.intro}</span>
          )}
        </div>

        <UploadField
          id="bl-pdf"
          label="By-laws PDF"
          kind="pdf"
          value={pdfUrl}
          onChange={function (url) {
            setPdfUrl(url);
          }}
          error={infoErrors.pdfUrl}
        />
      </div>

      <h2 className="admin-section-title admin-section-gap">Rules and Regulations</h2>

      <form className="admin-form" onSubmit={handleSectionSubmit} noValidate>
        <h3 className="admin-form-title">{sectionFormTitle}</h3>

        <div className="admin-field">
          <label htmlFor="bls-heading">Heading *</label>
          <input
            id="bls-heading"
            name="heading"
            type="text"
            value={sectionForm.heading}
            onChange={handleSectionChange}
            aria-invalid={sectionErrors.heading ? "true" : "false"}
          />
          {sectionErrors.heading && (
            <span className="admin-error">{sectionErrors.heading}</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="bls-text">Rule text *</label>
          <textarea
            id="bls-text"
            name="text"
            rows={5}
            value={sectionForm.text}
            onChange={handleSectionChange}
            aria-invalid={sectionErrors.text ? "true" : "false"}
          ></textarea>
          {sectionErrors.text && (
            <span className="admin-error">{sectionErrors.text}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-outline">
            <Plus size={18} /> {sectionSubmitText}
          </button>
          {editingIndex >= 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetSectionForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        {sections.length === 0 ? (
          <p className="empty-state">No rules yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Heading</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(function (item, index) {
                const isDeleting = deleteIndex === index;

                return (
                  <tr key={index}>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          aria-label={"Move " + item.heading + " up"}
                          disabled={index === 0}
                          onClick={function () {
                            moveSection(index, -1);
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn"
                          aria-label={"Move " + item.heading + " down"}
                          disabled={index === sections.length - 1}
                          onClick={function () {
                            moveSection(index, 1);
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{item.heading}</td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this rule?</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={function () {
                              confirmDeleteRule(index);
                            }}
                          >
                            Yes, remove
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={function () {
                              setDeleteIndex(-1);
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
                            aria-label={"Edit " + item.heading}
                            onClick={function () {
                              startEdit(index);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.heading}
                            onClick={function () {
                              setDeleteIndex(index);
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

      <div className="admin-form-actions admin-section-gap">
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving || deleting}
          onClick={handleSave}
        >
          <Save size={18} /> {saveText}
        </button>

        {confirmingDeleteAll ? (
          <>
            <span style={{ alignSelf: "center", fontSize: "0.9rem" }}>
              Permanently delete all by-laws?
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={deleting}
              onClick={handleDeleteAll}
            >
              {deleting ? "Deleting..." : "Yes, delete all"}
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={deleting}
              onClick={function () {
                setConfirmingDeleteAll(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          (intro !== "" || pdfUrl !== "" || sections.length > 0) && (
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={saving || deleting}
              onClick={function () {
                setConfirmingDeleteAll(true);
              }}
            >
              <Trash2 size={16} /> Delete All By-Laws
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default ByLaws;