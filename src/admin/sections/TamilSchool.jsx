
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Pencil } from "lucide-react";
import { apiGet, apiPut, apiDelete } from "../../api.js";

const startingSchool = {
  introduction: "",
  activities: [],
  images: [],
};

const emptyAnnouncementForm = {
  title: "",
  message: "",
  date: "",
  isPublished: true,
};

function linesToList(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function TamilSchool() {
  // School information
  const [savedSchool, setSavedSchool] = useState(startingSchool);
  const [introduction, setIntroduction] = useState("");
  const [activitiesText, setActivitiesText] = useState("");
  const [imagesText, setImagesText] = useState("");

  const [schoolLoading, setSchoolLoading] = useState(true);
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolErrors, setSchoolErrors] = useState({});
  const [schoolMessage, setSchoolMessage] = useState("");
  const [schoolServerError, setSchoolServerError] = useState("");

  // Announcements: local state, as in your existing file
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] =
    useState(emptyAnnouncementForm);
  const [editingId, setEditingId] = useState("");
  const [announcementErrors, setAnnouncementErrors] = useState({});
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // Load school information
  useEffect(() => {
    let cancelled = false;

    async function loadSchool() {
      try {
        const result = await apiGet("/tamil-school");
        if (cancelled) return;

        const data = result.data || startingSchool;

        const schoolData = {
          introduction: data.introduction || "",
          activities: Array.isArray(data.activities)
            ? data.activities
            : [],
          images: Array.isArray(data.images) ? data.images : [],
        };

        setSavedSchool(schoolData);
        setIntroduction(schoolData.introduction);
        setActivitiesText(schoolData.activities.join("\n"));
        setImagesText(schoolData.images.join("\n"));
      } catch (err) {
        if (!cancelled) {
          setSchoolServerError(
            "Could not load school information: " + err.message
          );
        }
      } finally {
        if (!cancelled) setSchoolLoading(false);
      }
    }

    loadSchool();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save school information to MongoDB
  async function handleSchoolSubmit(event) {
    event.preventDefault();

    setSchoolMessage("");
    setSchoolServerError("");

    const newErrors = {};

    if (introduction.length > 3000) {
      newErrors.introduction =
        "Information must be 3000 characters or fewer.";
    }

    const activities = linesToList(activitiesText);
    const images = linesToList(imagesText);

    if (activities.some((activity) => activity.length > 300)) {
      newErrors.activities =
        "Each activity must be 300 characters or fewer.";
    }

    if (images.some((url) => !/^(https?:\/\/|\/)/.test(url))) {
      newErrors.images =
        "Each image must be a full URL (https://...) or start with /.";
    }

    setSchoolErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cleanData = {
      introduction: introduction.trim(),
      activities,
      images,
    };

    setSchoolSaving(true);

    try {
      const result = await apiPut("/tamil-school", cleanData, true);
      const data = result.data;

      const updatedSchool = {
        introduction: data.introduction || "",
        activities: Array.isArray(data.activities) ? data.activities : [],
        images: Array.isArray(data.images) ? data.images : [],
      };

      setSavedSchool(updatedSchool);
      setIntroduction(updatedSchool.introduction);
      setActivitiesText(updatedSchool.activities.join("\n"));
      setImagesText(updatedSchool.images.join("\n"));
      setSchoolMessage("School information saved successfully.");
    } catch (err) {
      setSchoolServerError("Save failed: " + err.message);
    } finally {
      setSchoolSaving(false);
    }
  }

  function handleSchoolUndo() {
    setIntroduction(savedSchool.introduction);
    setActivitiesText(savedSchool.activities.join("\n"));
    setImagesText(savedSchool.images.join("\n"));
    setSchoolErrors({});
    setSchoolMessage("");
    setSchoolServerError("");
  }

  // DELETE ALL SCHOOL INFORMATION FROM DATABASE
  async function handleDeleteAllSchoolInfo() {
    const confirmed = window.confirm(
      "Delete all Tamil School information from the database? This cannot be undone."
    );

    if (!confirmed) return;

    setSchoolMessage("");
    setSchoolServerError("");
    setSchoolSaving(true);

    try {
      await apiDelete("/tamil-school", true);

      const emptyData = {
        introduction: "",
        activities: [],
        images: [],
      };

      setSavedSchool(emptyData);
      setIntroduction("");
      setActivitiesText("");
      setImagesText("");
      setSchoolErrors({});

      setSchoolMessage(
        "Tamil School information deleted successfully."
      );
    } catch (error) {
      setSchoolServerError("Delete failed: " + error.message);
    } finally {
      setSchoolSaving(false);
    }
  }

  // Announcement handlers (local state only)
  function handleAnnouncementChange(event) {
    const { name, type, value, checked } = event.target;

    setAnnouncementForm({
      ...announcementForm,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function resetAnnouncementForm() {
    setAnnouncementForm(emptyAnnouncementForm);
    setEditingId("");
    setAnnouncementErrors({});
  }

  function handleAnnouncementSubmit(event) {
    event.preventDefault();
    setAnnouncementMessage("");

    const errors = {};

    if (!announcementForm.title.trim()) {
      errors.title = "Title is required.";
    }

    if (announcementForm.title.length > 120) {
      errors.title = "Title must be 120 characters or fewer.";
    }

    if (announcementForm.message.length > 1000) {
      errors.message = "Message must be 1000 characters or fewer.";
    }

    if (!announcementForm.date) {
      errors.date = "Date is required.";
    }

    setAnnouncementErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const cleanData = {
      title: announcementForm.title.trim(),
      message: announcementForm.message.trim(),
      date: announcementForm.date,
      isPublished: announcementForm.isPublished,
    };

    if (editingId) {
      setAnnouncements((current) =>
        current.map((item) =>
          item._id === editingId ? { ...item, ...cleanData } : item
        )
      );
      setAnnouncementMessage("Announcement updated locally.");
    } else {
      setAnnouncements((current) => [
        { _id: "local-" + Date.now(), ...cleanData },
        ...current,
      ]);
      setAnnouncementMessage("Announcement added locally.");
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
    setAnnouncements((current) =>
      current.map((item) =>
        item._id === id
          ? { ...item, isPublished: !item.isPublished }
          : item
      )
    );
  }

  function confirmDelete(id) {
    setAnnouncements((current) =>
      current.filter((item) => item._id !== id)
    );

    setDeleteId("");
    setAnnouncementMessage("Announcement deleted locally.");

    if (editingId === id) resetAnnouncementForm();
  }

  const announcementFormTitle = editingId
    ? "Edit Announcement"
    : "Add Announcement";

  const announcementSubmitText = editingId
    ? "Save Changes"
    : "Add Announcement";

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Tamil School</h2>

      {schoolLoading && (
        <p className="loading-state">Loading school information...</p>
      )}

      {schoolServerError && (
        <div className="alert alert-error">{schoolServerError}</div>
      )}

      {schoolMessage && (
        <div className="alert alert-success">{schoolMessage}</div>
      )}

      <form
        className="admin-form"
        onSubmit={handleSchoolSubmit}
        noValidate
      >
        <h3 className="admin-form-title">School Information</h3>

        <div className="admin-field">
          <label htmlFor="ts-intro">About the school</label>
          <textarea
            id="ts-intro"
            rows={5}
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
            aria-invalid={Boolean(schoolErrors.introduction)}
          />
          {schoolErrors.introduction && (
            <span className="admin-error">
              {schoolErrors.introduction}
            </span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="ts-activities">
            Activities (one per line)
          </label>
          <textarea
            id="ts-activities"
            rows={4}
            value={activitiesText}
            onChange={(event) => setActivitiesText(event.target.value)}
            aria-invalid={Boolean(schoolErrors.activities)}
          />
          {schoolErrors.activities && (
            <span className="admin-error">
              {schoolErrors.activities}
            </span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="ts-images">Image links (one per line)</label>
          <textarea
            id="ts-images"
            rows={3}
            placeholder="https://... or /images/school.jpg"
            value={imagesText}
            onChange={(event) => setImagesText(event.target.value)}
            aria-invalid={Boolean(schoolErrors.images)}
          />
          {schoolErrors.images && (
            <span className="admin-error">{schoolErrors.images}</span>
          )}
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={schoolLoading || schoolSaving}
          >
            <Save size={18} />
            {schoolSaving ? "Saving..." : "Save School Information"}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSchoolUndo}
            disabled={schoolLoading || schoolSaving}
          >
            Undo Changes
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleDeleteAllSchoolInfo}
            disabled={schoolLoading || schoolSaving}
          >
            <Trash2 size={18} />
            Delete All School Information
          </button>
        </div>
      </form>

      <h2 className="admin-section-title">School Announcements</h2>

      {announcementMessage && (
        <div className="alert alert-success">{announcementMessage}</div>
      )}

      <form
        className="admin-form"
        onSubmit={handleAnnouncementSubmit}
        noValidate
      >
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
              aria-invalid={Boolean(announcementErrors.title)}
            />
            {announcementErrors.title && (
              <span className="admin-error">
                {announcementErrors.title}
              </span>
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
              aria-invalid={Boolean(announcementErrors.date)}
            />
            {announcementErrors.date && (
              <span className="admin-error">
                {announcementErrors.date}
              </span>
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
            aria-invalid={Boolean(announcementErrors.message)}
          />
          {announcementErrors.message && (
            <span className="admin-error">
              {announcementErrors.message}
            </span>
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
          <label htmlFor="tsa-published">
            Published (visible on the website)
          </label>
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
              {announcements.map((item) => {
                const isDeleting = deleteId === item._id;

                return (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.date}</td>
                    <td>
                      <button
                        type="button"
                        className={
                          item.isPublished
                            ? "admin-status admin-status-on"
                            : "admin-status admin-status-off"
                        }
                        onClick={() => togglePublished(item._id)}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this announcement?</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => confirmDelete(item._id)}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => setDeleteId("")}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => setDeleteId(item._id)}
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
