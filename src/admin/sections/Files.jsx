// src/admin/sections/Files.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, FileText, Image as ImageIcon, Music, File as FileGenericIcon } from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import UploadField from "../UploadField.jsx";

const typeOptions = [
  { value: "image", label: "Image (PNG, JPG, WebP)" },
  { value: "pdf", label: "PDF Document" },
  { value: "audio", label: "Audio (MP3, WAV)" },
  { value: "document", label: "Document" },
];

const emptyForm = {
  title: "",
  fileType: "image",
  fileUrl: "",
  publicId: "",
  isPublished: true,
};

function Files() {
  const [files, setFiles] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [deleteId, setDeleteId] = useState("");

  useEffect(
    function loadFiles() {
      let isCancelled = false;

      async function fetchFiles() {
        setLoading(true);
        setLoadError("");

        try {
          const endpoint = typeFilter === "all" ? "/files/admin" : "/files/admin?type=" + typeFilter;
          const result = await apiGet(endpoint, true);

          if (isCancelled === false) {
            setFiles(result.data);
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

      fetchFiles();

      return function cleanup() {
        isCancelled = true;
      };
    },
    [typeFilter]
  );

  function handleChange(event) {
    const fieldName = event.target.name;
    let fieldValue = event.target.value;

    if (event.target.type === "checkbox") {
      fieldValue = event.target.checked;
    }

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function handleUploadChange(url, publicId) {
    setFormData(function (prev) {
      return {
        ...prev,
        fileUrl: url || "",
        publicId: publicId || "",
      };
    });
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (!formData.fileUrl.trim()) {
      newErrors.fileUrl = "Please upload a file or enter a valid file URL.";
    }

    return newErrors;
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId("");
    setErrors({});
  }

  function startEdit(file) {
    setEditingId(file._id);
    setFormData({
      title: file.title || "",
      fileType: file.fileType || "image",
      fileUrl: file.fileUrl || "",
      publicId: file.publicId || "",
      isPublished: file.isPublished !== false,
    });
    setErrors({});
    setMessage("");
    setServerError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setServerError("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const result = await apiPut("/files/" + editingId, formData, true);
        setFiles(
          files.map(function (item) {
            if (item._id === editingId) {
              return result.data;
            }
            return item;
          })
        );
        setMessage("File updated successfully.");
      } else {
        const result = await apiPost("/files", formData, true);
        setFiles([...files, result.data]);
        setMessage("File uploaded and saved successfully.");
      }
      resetForm();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(file) {
    setMessage("");
    setServerError("");

    try {
      const result = await apiPut(
        "/files/" + file._id,
        { isPublished: !file.isPublished },
        true
      );

      setFiles(
        files.map(function (item) {
          if (item._id === file._id) {
            return result.data;
          }
          return item;
        })
      );
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function moveFile(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) {
      return;
    }

    setMessage("");
    setServerError("");

    const copy = files.slice();
    const moved = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = moved;

    const previousFiles = files;
    setFiles(copy);

    try {
      await apiPut(
        "/files/reorder",
        {
          ids: copy.map(function (item) {
            return item._id;
          }),
        },
        true
      );
    } catch (err) {
      setFiles(previousFiles);
      setServerError(err.message);
    }
  }

  async function confirmDelete(id) {
    setMessage("");
    setServerError("");

    try {
      await apiDelete("/files/" + id, true);
      setFiles(
        files.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("File deleted successfully.");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  let uploadKind = "image";
  if (formData.fileType === "audio") {
    uploadKind = "audio";
  } else if (formData.fileType === "pdf" || formData.fileType === "document") {
    uploadKind = "pdf";
  }

  let formTitle = "Upload New File";
  let submitText = "Upload & Save";
  if (editingId) {
    formTitle = "Edit File Details";
    submitText = "Save Changes";
  }
  if (saving) {
    submitText = "Saving...";
  }

  let listContent = null;
  if (loading) {
    listContent = <p className="loading-state">Loading files...</p>;
  } else if (loadError) {
    listContent = <p className="alert alert-error">{loadError}</p>;
  } else if (files.length === 0) {
    listContent = <p className="empty-state">No files uploaded yet.</p>;
  } else {
    listContent = (
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: "90px" }}>Order</th>
            <th style={{ width: "80px" }}>Preview</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(function (file, index) {
            const isDeleting = deleteId === file._id;

            let statusText = "Draft";
            let statusClass = "admin-status admin-status-off";
            if (file.isPublished) {
              statusText = "Published";
              statusClass = "admin-status admin-status-on";
            }

            let previewElem = null;
            if (file.fileType === "image" && file.fileUrl) {
              previewElem = (
                <img
                  src={file.fileUrl}
                  alt={file.title}
                  style={{ width: "50px", height: "38px", objectFit: "cover", borderRadius: "4px" }}
                />
              );
            } else if (file.fileType === "audio") {
              previewElem = <Music size={22} className="admin-hint" />;
            } else if (file.fileType === "pdf") {
              previewElem = <FileText size={22} className="admin-hint" />;
            } else {
              previewElem = <FileGenericIcon size={22} className="admin-hint" />;
            }

            return (
              <tr key={file._id}>
                <td>
                  <div className="admin-order-buttons">
                    <button
                      type="button"
                      className="admin-btn-icon"
                      disabled={index === 0}
                      onClick={function () {
                        moveFile(index, -1);
                      }}
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      disabled={index === files.length - 1}
                      onClick={function () {
                        moveFile(index, 1);
                      }}
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td>{previewElem}</td>
                <td>
                  <strong>{file.title}</strong>
                  <br />
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-link-inline"
                    style={{ fontSize: "0.82rem", wordBreak: "break-all" }}
                  >
                    View File
                  </a>
                </td>
                <td>
                  <span className="admin-badge" style={{ textTransform: "capitalize" }}>
                    {file.fileType}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={statusClass}
                    aria-label={"Toggle published for " + file.title}
                    onClick={function () {
                      togglePublished(file);
                    }}
                  >
                    {statusText}
                  </button>
                </td>
                <td>
                  {isDeleting ? (
                    <div className="admin-confirm">
                      <span>Delete this file?</span>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={function () {
                          confirmDelete(file._id);
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
                        aria-label={"Edit " + file.title}
                        onClick={function () {
                          startEdit(file);
                        }}
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        aria-label={"Delete " + file.title}
                        onClick={function () {
                          setDeleteId(file._id);
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
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Files & Media</h2>
        <p className="admin-section-subtitle">
          Upload and manage independent images, documents, and media. Published images in this section appear in the homepage photo carousel.
        </p>
      </div>

      {message && <p className="alert alert-success">{message}</p>}
      {serverError && <p className="alert alert-error">{serverError}</p>}

      {/* Upload / Edit Form */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 className="admin-card-title">{formTitle}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label htmlFor="file-title">
                Title / Caption <span className="required">*</span>
              </label>
              <input
                id="file-title"
                name="title"
                type="text"
                placeholder="e.g. Community Gathering 2026"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                aria-invalid={errors.title ? "true" : "false"}
              />
              {errors.title && <span className="admin-error">{errors.title}</span>}
            </div>

            <div className="admin-field">
              <label htmlFor="file-type">File Type</label>
              <select
                id="file-type"
                name="fileType"
                value={formData.fileType}
                onChange={handleChange}
              >
                {typeOptions.map(function (opt) {
                  return (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <UploadField
            id="file-upload"
            label="File Upload (Images will appear in homepage carousel)"
            kind={uploadKind}
            value={formData.fileUrl}
            onChange={handleUploadChange}
            error={errors.fileUrl}
            showLink={true}
          />

          <div className="admin-field-checkbox" style={{ marginTop: "1rem" }}>
            <label>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />{" "}
              Available for public display (published)
            </label>
          </div>

          <div className="admin-form-actions" style={{ marginTop: "1.5rem" }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              <Plus size={16} /> {submitText}
            </button>
            {editingId && (
              <button type="button" className="admin-btn" onClick={resetForm} disabled={saving}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* File Filter & List */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>Uploaded Files List</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label htmlFor="filter-type" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Filter:</label>
            <select
              id="filter-type"
              value={typeFilter}
              onChange={function (e) {
                setTypeFilter(e.target.value);
              }}
              style={{ padding: "0.35rem 0.65rem", borderRadius: "4px" }}
            >
              <option value="all">All Files</option>
              <option value="image">Images Only</option>
              <option value="pdf">PDF Documents</option>
              <option value="audio">Audio Files</option>
            </select>
          </div>
        </div>

        {listContent}
      </div>
    </div>
  );
}

export default Files;
