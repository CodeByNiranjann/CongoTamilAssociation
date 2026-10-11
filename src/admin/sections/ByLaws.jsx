// src/admin/sections/ByLaws.jsx
import { useState } from "react";
import { Save, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";

// TEMPORARY starting values. I have not invented any rules or regulations.
// Everything here only changes this page's memory for now.
// It is connected to the real backend API later.
// PDF: for now you paste a link or a path such as /documents/cta-by-laws.pdf.
// Later this can become a PDF upload to Cloudinary.
const startingByLaws = {
  intro: "",
  pdfUrl: "",
};

const startingSections = [
  {
    _id: "bl1",
    heading: "Sample rule heading",
    text: "Sample rule text.",
  },
];

const emptySectionForm = {
  heading: "",
  text: "",
};

function ByLaws() {
  // ----- Introduction and PDF -----
  const [savedByLaws, setSavedByLaws] = useState(startingByLaws);
  const [intro, setIntro] = useState(startingByLaws.intro);
  const [pdfUrl, setPdfUrl] = useState(startingByLaws.pdfUrl);
  const [infoErrors, setInfoErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");

  // ----- Rule sections -----
  const [sections, setSections] = useState(startingSections);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [editingId, setEditingId] = useState("");
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionMessage, setSectionMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // ----- Introduction and PDF handlers -----
  function handleInfoSubmit(event) {
    event.preventDefault();
    setInfoMessage("");

    const newErrors = {};

    if (intro.length > 2000) {
      newErrors.intro = "Introduction must be 2000 characters or fewer.";
    }

    const cleanPdf = pdfUrl.trim();
    if (cleanPdf !== "" && /^(https?:\/\/|\/)/.test(cleanPdf) === false) {
      newErrors.pdfUrl = "Enter a full link (https://...) or a path starting with /.";
    }

    setInfoErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSavedByLaws({ intro: intro.trim(), pdfUrl: cleanPdf });
    setInfoMessage("By-laws details saved.");
  }

  function handleInfoUndo() {
    setIntro(savedByLaws.intro);
    setPdfUrl(savedByLaws.pdfUrl);
    setInfoErrors({});
    setInfoMessage("");
  }

  // ----- Section handlers -----
  function handleSectionChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setSectionForm({ ...sectionForm, [fieldName]: fieldValue });
  }

  function resetSectionForm() {
    setSectionForm(emptySectionForm);
    setEditingId("");
    setSectionErrors({});
  }

  function handleSectionSubmit(event) {
    event.preventDefault();
    setSectionMessage("");

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

    const cleanData = {
      heading: sectionForm.heading.trim(),
      text: sectionForm.text.trim(),
    };

    if (editingId) {
      setSections(
        sections.map(function (item) {
          if (item._id === editingId) {
            return { ...item, ...cleanData };
          }
          return item;
        })
      );
      setSectionMessage("Rule updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setSections([...sections, newItem]);
      setSectionMessage("Rule added.");
    }

    resetSectionForm();
  }

  function startEdit(item) {
    setEditingId(item._id);
    setSectionForm({ heading: item.heading, text: item.text });
    setSectionErrors({});
    setSectionMessage("");
  }

  // Moves a rule up (direction -1) or down (direction 1)
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
  }

  function confirmDelete(id) {
    setSections(
      sections.filter(function (item) {
        return item._id !== id;
      })
    );
    setDeleteId("");
    setSectionMessage("Rule deleted.");

    if (editingId === id) {
      resetSectionForm();
    }
  }

  let sectionFormTitle = "Add Rule";
  let sectionSubmitText = "Add Rule";
  if (editingId) {
    sectionFormTitle = "Edit Rule";
    sectionSubmitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">By-Laws</h2>

      {/* Introduction and PDF */}
      {infoMessage && <div className="alert alert-success">{infoMessage}</div>}

      <form className="admin-form" onSubmit={handleInfoSubmit} noValidate>
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

        <div className="admin-field">
          <label htmlFor="bl-pdf">PDF link</label>
          <input
            id="bl-pdf"
            type="text"
            placeholder="https://... or /documents/cta-by-laws.pdf"
            value={pdfUrl}
            onChange={function (event) {
              setPdfUrl(event.target.value);
            }}
            aria-invalid={infoErrors.pdfUrl ? "true" : "false"}
          />
          {infoErrors.pdfUrl && (
            <span className="admin-error">{infoErrors.pdfUrl}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Details
          </button>
          <button type="button" className="btn btn-outline" onClick={handleInfoUndo}>
            Undo Changes
          </button>
        </div>
      </form>

      {/* Rule sections */}
      <h2 className="admin-section-title admin-section-gap">Rules and Regulations</h2>

      {sectionMessage && (
        <div className="alert alert-success">{sectionMessage}</div>
      )}

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
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {sectionSubmitText}
          </button>
          {editingId && (
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
                const isDeleting = deleteId === item._id;

                return (
                  <tr key={item._id}>
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
                            aria-label={"Edit " + item.heading}
                            onClick={function () {
                              startEdit(item);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.heading}
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
        )}
      </div>
    </div>
  );
}

export default ByLaws;