// src/admin/sections/AfricaTamilCharal.jsx
import { useState } from "react";
import { Save, Plus, Trash2, Pencil } from "lucide-react";

// TEMPORARY starting values. I have not invented any Africa Tamil Charal details.
// Everything here only changes this page's memory for now.
// It is connected to the real backend API later.
// Images and document links: for now you paste links. Later images become a Cloudinary upload.
const startingInfo = {
  introduction: "",
  images: [],
};

const startingAnnouncements = [
  {
    _id: "atc1",
    title: "Sample announcement",
    message: "Sample message.",
    date: "2026-10-10",
    isPublished: true,
  },
];

const startingDocuments = [
  {
    _id: "atd1",
    title: "Sample document",
    link: "https://drive.google.com",
    isPublished: true,
  },
];

const emptyAnnouncementForm = {
  title: "",
  message: "",
  date: "",
  isPublished: true,
};

const emptyDocumentForm = {
  title: "",
  link: "",
  isPublished: true,
};

function AfricaTamilCharal() {
  // ----- Information -----
  const [savedInfo, setSavedInfo] = useState(startingInfo);
  const [introduction, setIntroduction] = useState(startingInfo.introduction);
  const [imagesText, setImagesText] = useState(startingInfo.images.join("\n"));
  const [infoErrors, setInfoErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");

  // ----- Announcements -----
  const [announcements, setAnnouncements] = useState(startingAnnouncements);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [announcementErrors, setAnnouncementErrors] = useState({});
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState("");

  // ----- Documents -----
  const [documents, setDocuments] = useState(startingDocuments);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [editingDocumentId, setEditingDocumentId] = useState("");
  const [documentErrors, setDocumentErrors] = useState({});
  const [documentMessage, setDocumentMessage] = useState("");
  const [deleteDocumentId, setDeleteDocumentId] = useState("");

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

  // ----- Information handlers -----
  function handleInfoSubmit(event) {
    event.preventDefault();
    setInfoMessage("");

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

    setSavedInfo({ introduction: introduction.trim(), images: imageList });
    setInfoMessage("Information saved.");
  }

  function handleInfoUndo() {
    setIntroduction(savedInfo.introduction);
    setImagesText(savedInfo.images.join("\n"));
    setInfoErrors({});
    setInfoMessage("");
  }

  // ----- Announcement handlers -----
  function handleAnnouncementChange(event) {
    const fieldName = event.target.name;
    let fieldValue = event.target.value;

    if (event.target.type === "checkbox") {
      fieldValue = event.target.checked;
    }

    setAnnouncementForm({ ...announcementForm, [fieldName]: fieldValue });
  }

  function resetAnnouncementForm() {
    setAnnouncementForm(emptyAnnouncementForm);
    setEditingAnnouncementId("");
    setAnnouncementErrors({});
  }

  function handleAnnouncementSubmit(event) {
    event.preventDefault();
    setAnnouncementMessage("");

    const newErrors = {};

    if (announcementForm.title.trim() === "") {
      newErrors.title = "Title is required.";
    }

    if (announcementForm.title.length > 120) {
      newErrors.title = "Title must be 120 characters or fewer.";
    }

    if (announcementForm.message.length > 1000) {
      newErrors.message = "Message must be 1000 characters or fewer.";
    }

    if (announcementForm.date === "") {
      newErrors.date = "Date is required.";
    }

    setAnnouncementErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cleanData = {
      title: announcementForm.title.trim(),
      message: announcementForm.message.trim(),
      date: announcementForm.date,
      isPublished: announcementForm.isPublished,
    };

    if (editingAnnouncementId) {
      setAnnouncements(
        announcements.map(function (item) {
          if (item._id === editingAnnouncementId) {
            return { ...item, ...cleanData };
          }
          return item;
        })
      );
      setAnnouncementMessage("Announcement updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setAnnouncements([newItem, ...announcements]);
      setAnnouncementMessage("Announcement added.");
    }

    resetAnnouncementForm();
  }

  function startEditAnnouncement(item) {
    setEditingAnnouncementId(item._id);
    setAnnouncementForm({
      title: item.title,
      message: item.message || "",
      date: item.date,
      isPublished: item.isPublished,
    });
    setAnnouncementErrors({});
    setAnnouncementMessage("");
  }

  function toggleAnnouncementPublished(id) {
    setAnnouncements(
      announcements.map(function (item) {
        if (item._id === id) {
          return { ...item, isPublished: !item.isPublished };
        }
        return item;
      })
    );
  }

  function confirmDeleteAnnouncement(id) {
    setAnnouncements(
      announcements.filter(function (item) {
        return item._id !== id;
      })
    );
    setDeleteAnnouncementId("");
    setAnnouncementMessage("Announcement deleted.");

    if (editingAnnouncementId === id) {
      resetAnnouncementForm();
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
    setEditingDocumentId("");
    setDocumentErrors({});
  }

  function handleDocumentSubmit(event) {
    event.preventDefault();
    setDocumentMessage("");

    const newErrors = {};

    if (documentForm.title.trim() === "") {
      newErrors.title = "Title is required.";
    }

    if (documentForm.title.length > 150) {
      newErrors.title = "Title must be 150 characters or fewer.";
    }

    const link = documentForm.link.trim();
    if (link === "") {
      newErrors.link = "A PDF or Google Drive link is required.";
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

    if (editingDocumentId) {
      setDocuments(
        documents.map(function (item) {
          if (item._id === editingDocumentId) {
            return { ...item, ...cleanData };
          }
          return item;
        })
      );
      setDocumentMessage("Document updated.");
    } else {
      const newItem = { _id: "local-" + Date.now(), ...cleanData };
      setDocuments([newItem, ...documents]);
      setDocumentMessage("Document added.");
    }

    resetDocumentForm();
  }

  function startEditDocument(item) {
    setEditingDocumentId(item._id);
    setDocumentForm({
      title: item.title,
      link: item.link,
      isPublished: item.isPublished,
    });
    setDocumentErrors({});
    setDocumentMessage("");
  }

  function toggleDocumentPublished(id) {
    setDocuments(
      documents.map(function (item) {
        if (item._id === id) {
          return { ...item, isPublished: !item.isPublished };
        }
        return item;
      })
    );
  }

  function confirmDeleteDocument(id) {
    setDocuments(
      documents.filter(function (item) {
        return item._id !== id;
      })
    );
    setDeleteDocumentId("");
    setDocumentMessage("Document deleted.");

    if (editingDocumentId === id) {
      resetDocumentForm();
    }
  }

  let announcementFormTitle = "Add Announcement";
  let announcementSubmitText = "Add Announcement";
  if (editingAnnouncementId) {
    announcementFormTitle = "Edit Announcement";
    announcementSubmitText = "Save Changes";
  }

  let documentFormTitle = "Add Document";
  let documentSubmitText = "Add Document";
  if (editingDocumentId) {
    documentFormTitle = "Edit Document";
    documentSubmitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Africa Tamil Charal</h2>

      {/* Information */}
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
            placeholder="https://... or /images/photo.jpg"
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

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Information
          </button>
          <button type="button" className="btn btn-outline" onClick={handleInfoUndo}>
            Undo Changes
          </button>
        </div>
      </form>

      {/* Announcements */}
      <h2 className="admin-section-title">Announcements</h2>

      {announcementMessage && (
        <div className="alert alert-success">{announcementMessage}</div>
      )}

      <form className="admin-form" onSubmit={handleAnnouncementSubmit} noValidate>
        <h3 className="admin-form-title">{announcementFormTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="atca-title">Title *</label>
            <input
              id="atca-title"
              name="title"
              type="text"
              value={announcementForm.title}
              onChange={handleAnnouncementChange}
              aria-invalid={announcementErrors.title ? "true" : "false"}
            />
            {announcementErrors.title && (
              <span className="admin-error">{announcementErrors.title}</span>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="atca-date">Date *</label>
            <input
              id="atca-date"
              name="date"
              type="date"
              value={announcementForm.date}
              onChange={handleAnnouncementChange}
              aria-invalid={announcementErrors.date ? "true" : "false"}
            />
            {announcementErrors.date && (
              <span className="admin-error">{announcementErrors.date}</span>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="atca-message">Message (optional)</label>
          <textarea
            id="atca-message"
            name="message"
            rows={3}
            value={announcementForm.message}
            onChange={handleAnnouncementChange}
            aria-invalid={announcementErrors.message ? "true" : "false"}
          ></textarea>
          {announcementErrors.message && (
            <span className="admin-error">{announcementErrors.message}</span>
          )}
        </div>

        <div className="admin-check">
          <input
            id="atca-published"
            name="isPublished"
            type="checkbox"
            checked={announcementForm.isPublished}
            onChange={handleAnnouncementChange}
          />
          <label htmlFor="atca-published">Published (visible on the website)</label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {announcementSubmitText}
          </button>
          {editingAnnouncementId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetAnnouncementForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        {announcements.length === 0 ? (
          <p className="empty-state">No announcements yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(function (item) {
                const isDeleting = deleteAnnouncementId === item._id;

                let statusText = "Draft";
                let statusClass = "admin-status admin-status-off";
                if (item.isPublished) {
                  statusText = "Published";
                  statusClass = "admin-status admin-status-on";
                }

                return (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.date}</td>
                    <td>
                      <button
                        type="button"
                        className={statusClass}
                        aria-label={"Toggle published for " + item.title}
                        onClick={function () {
                          toggleAnnouncementPublished(item._id);
                        }}
                      >
                        {statusText}
                      </button>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this announcement?</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={function () {
                              confirmDeleteAnnouncement(item._id);
                            }}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={function () {
                              setDeleteAnnouncementId("");
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
                              startEditAnnouncement(item);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.title}
                            onClick={function () {
                              setDeleteAnnouncementId(item._id);
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

      {/* Documents */}
      <h2 className="admin-section-title admin-section-gap">Documents</h2>

      {documentMessage && (
        <div className="alert alert-success">{documentMessage}</div>
      )}

      <form className="admin-form" onSubmit={handleDocumentSubmit} noValidate>
        <h3 className="admin-form-title">{documentFormTitle}</h3>

        <div className="admin-form-row">
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

          <div className="admin-field">
            <label htmlFor="atcd-link">PDF / Google Drive link *</label>
            <input
              id="atcd-link"
              name="link"
              type="text"
              placeholder="https://drive.google.com/..."
              value={documentForm.link}
              onChange={handleDocumentChange}
              aria-invalid={documentErrors.link ? "true" : "false"}
            />
            {documentErrors.link && (
              <span className="admin-error">{documentErrors.link}</span>
            )}
          </div>
        </div>

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
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {documentSubmitText}
          </button>
          {editingDocumentId && (
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
                const isDeleting = deleteDocumentId === item._id;

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
                          toggleDocumentPublished(item._id);
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
                              confirmDeleteDocument(item._id);
                            }}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={function () {
                              setDeleteDocumentId("");
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
                              startEditDocument(item);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + item.title}
                            onClick={function () {
                              setDeleteDocumentId(item._id);
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