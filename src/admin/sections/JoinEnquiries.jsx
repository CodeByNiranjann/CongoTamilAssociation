// src/admin/sections/JoinEnquiries.jsx
import { useState } from "react";
import { Eye, X, Trash2 } from "lucide-react";

// TEMPORARY sample data (placeholder person, not a real enquiry).
// Status changes and deletes only affect this page's memory for now.
// Later this list comes from the backend. New enquiries also raise the
// notification badge on the dashboard.
// emailStatus will show whether the notification email was delivered:
// "Sent", "Failed" or "Not sent yet". The enquiry itself is always saved first.
const startingEnquiries = [
  {
    _id: "q1",
    name: "Sample Person",
    phone: "+000 000 000 000",
    email: "sample@example.com",
    company: "Sample Company",
    status: "New",
    emailStatus: "Not sent yet",
    createdAt: "2026-10-10",
  },
];

const statusOptions = ["New", "Contacted", "Completed"];

function JoinEnquiries() {
  const [enquiries, setEnquiries] = useState(startingEnquiries);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  function handleStatusChange(id, newStatus) {
    const updated = enquiries.map(function (item) {
      if (item._id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setEnquiries(updated);
    setMessage("Status updated to " + newStatus + ".");
  }

  function confirmDelete(id) {
    const remaining = enquiries.filter(function (item) {
      return item._id !== id;
    });
    setEnquiries(remaining);
    setDeleteId("");
    setMessage("Enquiry deleted.");

    if (selectedId === id) {
      setSelectedId("");
    }
  }

  function getStatusClass(status) {
    if (status === "Contacted") {
      return "admin-status admin-status-contacted";
    }
    if (status === "Completed") {
      return "admin-status admin-status-on";
    }
    return "admin-status admin-status-new";
  }

  const visibleEnquiries = enquiries.filter(function (item) {
    if (filter === "All") {
      return true;
    }
    return item.status === filter;
  });

  const selected = enquiries.find(function (item) {
    return item._id === selectedId;
  });

  let detailPanel = null;
  if (selected) {
    detailPanel = (
      <div className="admin-form">
        <div className="admin-detail-head">
          <h3 className="admin-form-title">Enquiry Details</h3>
          <button
            type="button"
            className="admin-btn"
            aria-label="Close details"
            onClick={function () {
              setSelectedId("");
            }}
          >
            <X size={16} /> Close
          </button>
        </div>

        <dl className="admin-detail-list">
          <dt>Name</dt>
          <dd>{selected.name}</dd>
          <dt>Phone</dt>
          <dd>{selected.phone}</dd>
          <dt>Email</dt>
          <dd>{selected.email}</dd>
          <dt>Company</dt>
          <dd>{selected.company}</dd>
          <dt>Received on</dt>
          <dd>{selected.createdAt}</dd>
          <dt>Notification email</dt>
          <dd>{selected.emailStatus}</dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Join CTA Enquiries</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-filter">
        <label htmlFor="enquiry-filter">Show</label>
        <select
          id="enquiry-filter"
          value={filter}
          onChange={function (event) {
            setFilter(event.target.value);
          }}
        >
          <option value="All">All enquiries</option>
          {statusOptions.map(function (status) {
            return (
              <option key={status} value={status}>
                {status}
              </option>
            );
          })}
        </select>
      </div>

      {detailPanel}

      <div className="admin-table-wrap">
        {visibleEnquiries.length === 0 ? (
          <p className="empty-state">No enquiries to show.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Received</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEnquiries.map(function (item) {
                const isDeleting = deleteId === item._id;

                return (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.company}</td>
                    <td>{item.createdAt}</td>
                    <td>
                      <select
                        className={getStatusClass(item.status)}
                        value={item.status}
                        aria-label={"Status for " + item.name}
                        onChange={function (event) {
                          handleStatusChange(item._id, event.target.value);
                        }}
                      >
                        {statusOptions.map(function (status) {
                          return (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td>
                      {isDeleting ? (
                        <div className="admin-confirm">
                          <span>Delete this enquiry?</span>
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
                            aria-label={"View " + item.name}
                            onClick={function () {
                              setSelectedId(item._id);
                              setMessage("");
                            }}
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            aria-label={"Delete enquiry from " + item.name}
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

export default JoinEnquiries;