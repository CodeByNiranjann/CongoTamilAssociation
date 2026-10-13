// src/admin/sections/AfricaTamilCharal.jsx
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Pencil } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import UploadField from "../UploadField.jsx";

const emptyDocumentForm = {
  title: "",
  link: "",
  isPublished: true,
};

function linesToList(text) {
  return text
    .split("\n")
    .map(function (line) {
      return line.trim();
    })
    .filter(function (line) {
      return line !== "";
    });
}

function AfricaTamilCharal() {
  // ----- Information -----
  const [introduction, setIntroduction] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoErrors, setInfoErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");

  // ----- Documents -----
  const [documents, setDocuments] = useState([]);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [editingId, setEditingId] = useState("");
  const [documentErrors, setDocumentErrors] = useState({});
  const [documentSaving, setDocumentSaving] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");

  useEffect(function loadAll() {
    let isCancelled = false;

    async function fetchAll() {
      try {
        const results = await Promise.all([
          apiGet("/africa-tamil-charal"),
          apiGet("/africa-tamil-charal/documents/admin", true),
        ]);

        if (isCancelled === false) {
          setIntroduction(results[0].data.introduction || "");
          setImagesText((results[0].data.images || []).join("\n"));
          setDocuments(results[1].data);
        }
      } catch (err) {
        if (isCancelled === false) {
          setLoadError(err.message);
        }
      } finally {
        if (isCancelled === false) {
          setInfoLoading(false);
        }
      }
    }

    fetchAll();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function addImage(url) {
    setImagesText(function (previous) {
      if (previous.trim() === "") {
        return url;
      }
      return previous + "\n" + url;
    });
  }

  async function handleInfoSubmit(event) {
    event.preventDefault();
    setInfoMessage("");
    setServerError("");

    const newErrors = {};

    if (introduction.length > 3000) {
      newErrors.introduction = "Information must be 3000 characters or fewer.";
    }

    const imageList = linesToList(imagesText);
    const badImage = imageList.find(function (url) {
      return /^(https?:\/\/|\/)/.test(url) === false;
    });
    if (badImage) {
      newErrors.images = "Each image must be a full link (https://...) or start with /.";
    }

    setInfoErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setInfoSaving(true);

    try {
      await apiPut(
        "/africa-tamil-charal",
        { introduction: introduction.trim(), images: imageList },
        true
      );
      setInfoMessage("Information saved.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setInfoSaving(false);
    }
  }

  // ----- Document handlers -----
  function handleDocumentChange(event) {
    const fieldName = event.target.name;
    let fieldValue = event.target.value;

    if (event.target.type === "checkbox") {
      fieldValue = event.target.checked;
    }

    setDocumentForm({ ...documentForm, [fieldName]: fieldValue });
  }

  function resetDocumentForm() {
    setDocumentForm(emptyDocumentForm);
    setEditingId("");
    setDocumentErrors({});
  }

  async function handleDocumentSubmit(event) {
    event.preventDefault();
    setDocumentMessage("");
    setServerError("");

    const newErrors = {};

    if (documentForm.title.trim() === "") {
      newErrors.title = "Title is required.";
    }

    if (documentForm.title.length > 150) {
      newErrors.title = "Title must be 150 characters or fewer.";
    }

    const link = documentForm.link.trim();
    if (link === "") {
      newErrors.link = "Upload a PDF or enter a link.";
    } else if (/^https?:\/\//.test(link) === false) {
      newErrors.link = "Enter a full link starting with https://";
    }

    setDocumentErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cleanData = {
      title: documentForm.title.trim(),
      link: link,
      isPublished: documentForm.isPublished,
    };

    setDocumentSaving(true);

    try {
      if (editingId) {
        const result = await apiPut(
          "/africa-tamil-charal/documents/" + editingId,
          cleanData,
          true
        );
        setDocuments(
          documents.map(function (item) {
            if (item._id === editingId) {
              return result.data;
            }
            return item;
          })
        );
        setDocumentMessage("Document updated.");
      } else {
        const result = await apiPost(
          "/africa-tamil-charal/documents",
          cleanData,
          true
        );
        setDocuments([result.data, ...documents]);
        setDocumentMessage("Document added.");
      }

      resetDocumentForm();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDocumentSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setDocumentForm({
      title: item.title,
      link: item.link,
      isPublished: item.isPublished,
    });
    setDocumentErrors({});
    setDocumentMessage("");
  }

  async function togglePublished(item) {
    setDocumentMessage("");
    setServerError("");

    try {
      const result = await apiPut(
        "/africa-tamil-charal/documents/" + item._id,
        { isPublished: !item.isPublished },
        true
      );
      setDocuments(
        documents.map(function (current) {
          if (current._id === item._id) {
            return result.data;
          }
          return current;
        })
      );
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function confirmDelete(id) {
    setDocumentMessage("");
    setServerError("");

    try {
      await apiDelete("/africa-tamil-charal/documents/" + id, true);
      setDocuments(
        documents.filter(function (item) {
          return item._id !== id;
        })
      );
      setDocumentMessage("Document deleted.");

      if (editingId === id) {
        resetDocumentForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  if (infoLoading) {
    return (
      <div className="admin-section">
        <p className="loading-state">Loading Africa Tamil Charal...</p>
      </div>
    );
  }

  let infoButtonText = "Save Information";
  if (infoSaving) {
    infoButtonText = "Saving...";
  }

  let documentFormTitle = "Add Document";
  let documentSubmitText = "Add Document";
  if (editingId) {
    documentFormTitle = "Edit Document";
    documentSubmitText = "Save Changes";
  }
  if (documentSaving) {
    documentSubmitText = "Saving...";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Africa Tamil Charal</h2>

      {loadError && <div className="alert alert-error">{loadError}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}
      {infoMessage && <div className="alert alert-success">{infoMessage}</div>}

      <form className="admin-form" onSubmit={handleInfoSubmit} noValidate>
        <h3 className="admin-form-title">Information</h3>

        <div className="admin-field">
          <label htmlFor="atc-intro">About Africa Tamil Charal</label>
          <textarea
            id="atc-intro"
            rows={5}
            value={introduction}
            onChange={function (event) {
              setIntroduction(event.target.value);
            }}
            aria-invalid={infoErrors.introduction ? "true" : "false"}
          ></textarea>
          {infoErrors.introduction && (
            <span className="admin-error">{infoErrors.introduction}</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="atc-images">Image links (one per line)</label>
          <textarea
            id="atc-images"
            rows={3}
            value={imagesText}
            onChange={function (event) {
              setImagesText(event.target.value);
            }}
            aria-invalid={infoErrors.images ? "true" : "false"}
          ></textarea>
          {infoErrors.images && (
            <span className="admin-error">{infoErrors.images}</span>
          )}
        </div>

        <UploadField
          id="atc-upload"
          label="Upload a photo (adds it to the list above)"
          kind="image"
          showLink={false}
          onChange={addImage}
        />

        <p className="admin-hint">
          Announcements are managed in the Announcements page, and publications
          in the Publications page.
        </p>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={infoSaving}>
            <Save size={18} /> {infoButtonText}
          </button>
        </div>
      </form>

      <h2 className="admin-section-title admin-section-gap">Documents</h2>

      {documentMessage && (
        <div className="alert alert-success">{documentMessage}</div>
      )}

      <form className="admin-form" onSubmit={handleDocumentSubmit} noValidate>
        <h3 className="admin-form-title">{documentFormTitle}</h3>

        <div className="admin-field">
          <label htmlFor="atcd-title">Title *</label>
          <input
            id="atcd-title"
            name="title"
            type="text"
            value={documentForm.title}
            onChange={handleDocumentChange}
            aria-invalid={documentErrors.title ? "true" : "false"}
          />
          {documentErrors.title && (
            <span className="admin-error">{documentErrors.title}</span>
          )}
        </div>

        <UploadField
          id="atcd-link"
          label="PDF file or Google Drive link *"
          kind="pdf"
          value={documentForm.link}
          onChange={function (url) {
            setDocumentForm({ ...documentForm, link: url });
          }}
          error={documentErrors.link}
        />

        <div className="admin-check">
          <input
            id="atcd-published"
            name="isPublished"
            type="checkbox"
            checked={documentForm.isPublished}
            onChange={handleDocumentChange}
          />
          <label htmlFor="atcd-published">Published (visible on the website)</label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={documentSaving}>
            <Plus size={18} /> {documentSubmitText}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetDocumentForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        {documents.length === 0 ? (
          <p className="empty-state">No documents yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(function (item) {
                const isDeleting = deleteId === item._id;

                let statusText = "Draft";
                let statusClass = "admin-status admin-status-off";
                if (item.isPublished) {
                  statusText = "Published";
                  statusClass = "admin-status admin-status-on";
                }

                return (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>
                      <button
                        type="button"
                        className={statusClass}
                        aria-label={"Toggle published for " + item.title}
                        onClick={function () {
                          togglePublished(item);
                        }}
                      >
                        {statusText}
                      </button>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this document?</span>
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
                            aria-label={"Edit " + item.title}
                            onClick={function () {
                              startEdit(item);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.title}
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

export default AfricaTamilCharal;