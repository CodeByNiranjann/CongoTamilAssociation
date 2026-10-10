// src/admin/sections/Banners.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

// TEMPORARY sample data (generic text, not official CTA content).
// Add, edit, delete, reorder and publish only change this page's memory for now.
// They are connected to the real backend API later.
// Image upload: for now you paste an image URL. Later this becomes a file upload to Cloudinary.
const startingBanners = [
  {
    _id: "b1",
    title: "Sample banner one",
    description: "Sample description",
    imageUrl: "",
    buttonText: "About Us",
    buttonLink: "/about",
    isPublished: true,
  },
  {
    _id: "b2",
    title: "Sample banner two",
    description: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    isPublished: false,
  },
];

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  isPublished: true,
};

function Banners() {
  const [banners, setBanners] = useState(startingBanners);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  function handleChange(event) {
    const fieldName = event.target.name;
    let fieldValue = event.target.value;

    if (event.target.type === "checkbox") {
      fieldValue = event.target.checked;
    }

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.title.trim() === "") {
      newErrors.title = "Title is required.";
    }

    if (formData.description.length > 300) {
      newErrors.description = "Description must be 300 characters or fewer.";
    }

    const imageUrl = formData.imageUrl.trim();
    if (imageUrl !== "" && /^(https?:\/\/|\/)/.test(imageUrl) === false) {
      newErrors.imageUrl = "Enter a full link (https://...) or a path starting with /.";
    }

    const hasText = formData.buttonText.trim() !== "";
    const hasLink = formData.buttonLink.trim() !== "";
    if (hasText && hasLink === false) {
      newErrors.buttonLink = "Add a button link, or clear the button text.";
    }
    if (hasLink && hasText === false) {
      newErrors.buttonText = "Add button text, or clear the button link.";
    }

    return newErrors;
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId("");
    setErrors({});
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
      imageUrl: formData.imageUrl.trim(),
      buttonText: formData.buttonText.trim(),
      buttonLink: formData.buttonLink.trim(),
      isPublished: formData.isPublished,
    };

    if (editingId) {
      const updatedBanners = banners.map(function (banner) {
        if (banner._id === editingId) {
          return { ...banner, ...cleanData };
        }
        return banner;
      });
      setBanners(updatedBanners);
      setMessage("Banner updated.");
    } else {
      const newBanner = { _id: "local-" + Date.now(), ...cleanData };
      setBanners([...banners, newBanner]);
      setMessage("Banner added.");
    }

    resetForm();
  }

  function startEdit(banner) {
    setEditingId(banner._id);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      isPublished: banner.isPublished,
    });
    setErrors({});
    setMessage("");
    window.scrollTo(0, 0);
  }

  function togglePublished(id) {
    const updatedBanners = banners.map(function (banner) {
      if (banner._id === id) {
        return { ...banner, isPublished: !banner.isPublished };
      }
      return banner;
    });
    setBanners(updatedBanners);
  }

  // Moves a banner up (direction -1) or down (direction 1) in the list
  function moveBanner(index, direction) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= banners.length) {
      return;
    }

    const copy = banners.slice();
    const movedBanner = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = movedBanner;
    setBanners(copy);
  }

  function confirmDelete(id) {
    const remainingBanners = banners.filter(function (banner) {
      return banner._id !== id;
    });
    setBanners(remainingBanners);
    setDeleteId("");
    setMessage("Banner deleted.");

    if (editingId === id) {
      resetForm();
    }
  }

  let formTitle = "Add Banner";
  let submitText = "Add Banner";
  if (editingId) {
    formTitle = "Edit Banner";
    submitText = "Save Changes";
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Homepage Banners</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add / edit form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h3 className="admin-form-title">{formTitle}</h3>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="banner-title">Title *</label>
            <input
              id="banner-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className="admin-error">{errors.title}</span>}
          </div>

          <div className="admin-field">
            <label htmlFor="banner-image">Image link</label>
            <input
              id="banner-image"
              name="imageUrl"
              type="text"
              placeholder="https://... or /images/banner.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
              aria-invalid={errors.imageUrl ? "true" : "false"}
            />
            {errors.imageUrl && (
              <span className="admin-error">{errors.imageUrl}</span>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="banner-description">Description</label>
          <textarea
            id="banner-description"
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            aria-invalid={errors.description ? "true" : "false"}
          ></textarea>
          {errors.description && (
            <span className="admin-error">{errors.description}</span>
          )}
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="banner-button-text">Button text (optional)</label>
            <input
              id="banner-button-text"
              name="buttonText"
              type="text"
              value={formData.buttonText}
              onChange={handleChange}
              aria-invalid={errors.buttonText ? "true" : "false"}
            />
            {errors.buttonText && (
              <span className="admin-error">{errors.buttonText}</span>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="banner-button-link">Button link (optional)</label>
            <input
              id="banner-button-link"
              name="buttonLink"
              type="text"
              placeholder="/join-cta or https://..."
              value={formData.buttonLink}
              onChange={handleChange}
              aria-invalid={errors.buttonLink ? "true" : "false"}
            />
            {errors.buttonLink && (
              <span className="admin-error">{errors.buttonLink}</span>
            )}
          </div>
        </div>

        <div className="admin-check">
          <input
            id="banner-published"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <label htmlFor="banner-published">Published (visible on the website)</label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> {submitText}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Banner list */}
      <div className="admin-table-wrap">
        {banners.length === 0 ? (
          <p className="empty-state">No banners yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(function (banner, index) {
                const isDeleting = deleteId === banner._id;

                let statusText = "Draft";
                let statusClass = "admin-status admin-status-off";
                if (banner.isPublished) {
                  statusText = "Published";
                  statusClass = "admin-status admin-status-on";
                }

                return (
                  <tr key={banner._id}>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          aria-label={"Move " + banner.title + " up"}
                          disabled={index === 0}
                          onClick={function () {
                            moveBanner(index, -1);
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn"
                          aria-label={"Move " + banner.title + " down"}
                          disabled={index === banners.length - 1}
                          onClick={function () {
                            moveBanner(index, 1);
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{banner.title}</td>
                    <td>
                      <button
                        type="button"
                        className={statusClass}
                        aria-label={"Toggle published for " + banner.title}
                        onClick={function () {
                          togglePublished(banner._id);
                        }}
                      >
                        {statusText}
                      </button>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this banner?</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={function () {
                              confirmDelete(banner._id);
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
                            aria-label={"Edit " + banner.title}
                            onClick={function () {
                              startEdit(banner);
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete " + banner.title}
                            onClick={function () {
                              setDeleteId(banner._id);
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

export default Banners;