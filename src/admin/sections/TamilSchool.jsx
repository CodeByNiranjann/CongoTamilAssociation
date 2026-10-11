// src/admin/sections/TamilSchool.jsx
import { useState } from "react";
import { Save, Plus, Trash2, Pencil } from "lucide-react";

// TEMPORARY starting values. I have not invented any school details.
// Everything here only changes this page's memory for now.
// It is connected to the real backend API later.
// Images: for now you paste image URLs. Later this becomes a file upload to Cloudinary.
const startingSchool = {
  introduction: "",
  activities: [],
  images: [],
};

const startingAnnouncements = [
  {
    _id: "ts1",
    title: "Sample school announcement",
    message: "Sample message.",
    date: "2026-10-10",
    isPublished: true,
  },
];

const emptyAnnouncementForm = {
  title: "",
  message: "",
  date: "",
  isPublished: true,
};

function TamilSchool() {
  // ----- School information -----
  const [savedSchool, setSavedSchool] = useState(startingSchool);
  const [introduction, setIntroduction] = useState(startingSchool.introduction);
  const [activitiesText, setActivitiesText] = useState(
    startingSchool.activities.join("\n")
  );
  const [imagesText, setImagesText] = useState(startingSchool.images.join("\n"));
  const [schoolErrors, setSchoolErrors] = useState({});
  const [schoolMessage, setSchoolMessage] = useState("");

  // ----- Announcements -----
  const [announcements, setAnnouncements] = useState(startingAnnouncements);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);
  const [editingId, setEditingId] = useState("");
  const [announcementErrors, setAnnouncementErrors] = useState({});
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // Turns a textarea (one item per line) into a clean list
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

  function handleSchoolSubmit(event) {
    event.preventDefault();
    setSchoolMessage("");

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

    setSchoolErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSavedSchool({
      introduction: introduction.trim(),
      activities: linesToList(activitiesText),
      images: imageList,
    });
    setSchoolMessage("School information saved.");
  }

  function handleSchoolUndo() {
    setIntroduction(savedSchool.introduction);
    setActivitiesText(savedSchool.activities.join("\n"));
    setImagesText(savedSchool.images.join("\n"));
    setSchoolErrors({});
    setSchoolMessage("");
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
    setEditingId("");
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

    if (editingId) {
      setAnnouncements(
        announcements.map(function (item) {
          if (item._id === editingId) {
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

  function startEdit(item) {
    setEditingId(item._id);
    setAnnouncementForm({
      title: item.title,
      message: item.message || "",
      date: item.date,
      isPublished: item.isPublished,
    });
    setAnnouncementErrors({});
    setAnnouncementMessage("");
  }

  function togglePublished(id) {
    setAnnouncements(
      announcements.map(function (item) {
        if (item._id === id) {
          return { ...item, isPublished: !item.isPublished };
        }
        return item;
      })
    );
  }

  function confirmDelete(id) {
    setAnnouncements(
      announcements.filter(function (item) {
        return item._id !== id;
      })
    );
    setDeleteId("");
    setAnnouncementMessage("Announcement deleted.");

    if (editingId === id) {
      resetAnnouncementForm();
    }
  }

  let announcementFormTitle = "Add Announcement";
  let announcementSubmitText = "Add Announcement";
  if (editingId) {
    announcementFormTitle = "Edit Announcement";
    announcementSubmitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Tamil School</h2>

      {/* School information */}
      {schoolMessage && <div className="alert alert-success">{schoolMessage}</div>}

      <form className="admin-form" onSubmit={handleSchoolSubmit} noValidate>
        <h3 className="admin-form-title">School Information</h3>

        <div className="admin-field">
          <label htmlFor="ts-intro">About the school</label>
          <textarea
            id="ts-intro"
            rows={5}
            value={introduction}
            onChange={function (event) {
              setIntroduction(event.target.value);
            }}
            aria-invalid={schoolErrors.introduction ? "true" : "false"}
          ></textarea>
          {schoolErrors.introduction && (
            <span className="admin-error">{schoolErrors.introduction}</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="ts-activities">Activities (one per line)</label>
          <textarea
            id="ts-activities"
            rows={4}
            value={activitiesText}
            onChange={function (event) {
              setActivitiesText(event.target.value);
            }}
          ></textarea>
        </div>

        <div className="admin-field">
          <label htmlFor="ts-images">Image links (one per line)</label>
          <textarea
            id="ts-images"
            rows={3}
            placeholder="https://... or /images/school.jpg"
            value={imagesText}
            onChange={function (event) {
              setImagesText(event.target.value);
            }}
            aria-invalid={schoolErrors.images ? "true" : "false"}
          ></textarea>
          {schoolErrors.images && (
            <span className="admin-error">{schoolErrors.images}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save School Information
          </button>
          <button type="button" className="btn btn-outline" onClick={handleSchoolUndo}>
            Undo Changes
          </button>
        </div>
      </form>

      {/* Announcements */}
      <h2 className="admin-section-title">School Announcements</h2>

      {announcementMessage && (
        <div className="alert alert-success">{announcementMessage}</div>
      )}

      <form className="admin-form" onSubmit={handleAnnouncementSubmit} noValidate>
        <h3 className="admin-form-title">{announcementFormTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="tsa-title">Title *</label>
            <input
              id="tsa-title"
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
            <label htmlFor="tsa-date">Date *</label>
            <input
              id="tsa-date"
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
          <label htmlFor="tsa-message">Message (optional)</label>
          <textarea
            id="tsa-message"
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
            id="tsa-published"
            name="isPublished"
            type="checkbox"
            checked={announcementForm.isPublished}
            onChange={handleAnnouncementChange}
          />
          <label htmlFor="tsa-published">Published (visible on the website)</label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {announcementSubmitText}
          </button>
          {editingId && (
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
                    <td>{item.date}</td>
                    <td>
                      <button
                        type="button"
                        className={statusClass}
                        aria-label={"Toggle published for " + item.title}
                        onClick={function () {
                          togglePublished(item._id);
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

export default TamilSchool;