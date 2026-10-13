// src/admin/sections/JobSeekers.jsx
import { useState, useEffect } from "react";
import { Eye, FileText, X, Trash2 } from "lucide-react";

import { apiGet, apiPut, apiDelete } from "../../api.js";

const statusOptions = ["New", "Contacted", "Completed"];

function getStatusClass(status) {
  if (status === "Contacted") {
    return "admin-status admin-status-contacted";
  }
  if (status === "Completed") {
    return "admin-status admin-status-on";
  }
  return "admin-status admin-status-new";
}

function JobSeekers() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [cvLink, setCvLink] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(
    function loadApplications() {
      let isCancelled = false;

      async function fetchApplications() {
        setLoading(true);
        setLoadError("");

        let path = "/job-seekers?page=" + page + "&limit=20";
        if (filter !== "All") {
          path = path + "&status=" + filter;
        }

        try {
          const result = await apiGet(path, true);

          if (isCancelled === false) {
            setApplications(result.data);
            setPagination(result.pagination);
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

      fetchApplications();

      return function cleanup() {
        isCancelled = true;
      };
    },
    [page, filter]
  );

  function handleFilterChange(event) {
    setFilter(event.target.value);
    setPage(1);
    setSelectedId("");
    setCvLink(null);
  }

  function openDetails(id) {
    setSelectedId(id);
    setCvLink(null);
    setMessage("");
    setServerError("");
  }

  async function handleStatusChange(id, newStatus) {
    setMessage("");
    setServerError("");

    try {
      const result = await apiPut(
        "/job-seekers/" + id + "/status",
        { status: newStatus },
        true
      );

      setApplications(
        applications.map(function (item) {
          if (item._id === id) {
            return result.data;
          }
          return item;
        })
      );
      setMessage("Status updated to " + newStatus + ".");
    } catch (err) {
      setServerError(err.message);
    }
  }

  // Asks the backend (admin login checked) for a short-lived CV link
  async function requestCvLink(id) {
    setCvLoading(true);
    setServerError("");
    setCvLink(null);

    try {
      const result = await apiGet("/job-seekers/" + id + "/cv", true);
      setCvLink(result);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setCvLoading(false);
    }
  }

  async function confirmDelete(id) {
    setMessage("");
    setServerError("");

    try {
      await apiDelete("/job-seekers/" + id, true);

      setApplications(
        applications.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("Application deleted.");

      if (selectedId === id) {
        setSelectedId("");
        setCvLink(null);
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

  const selected = applications.find(function (item) {
    return item._id === selectedId;
  });

  let detailPanel = null;
  if (selected) {
    let cvContent = <span>No CV on file.</span>;

    if (selected.hasCv) {
      let cvButtonText = "Get CV link";
      if (cvLoading) {
        cvButtonText = "Getting link...";
      }

      cvContent = (
        <div className="admin-row-actions">
          <button
            type="button"
            className="admin-btn"
            disabled={cvLoading}
            onClick={function () {
              requestCvLink(selected._id);
            }}
          >
            <FileText size={16} /> {cvButtonText}
          </button>
          {cvLink && (
            <a href={cvLink.url} target="_blank" rel="noopener noreferrer">
              Open {cvLink.fileName || "CV"} (link works for {cvLink.expiresInMinutes} minutes)
            </a>
          )}
        </div>
      );
    }

    detailPanel = (
      <div className="admin-form">
        <div className="admin-detail-head">
          <h3 className="admin-form-title">Application Details</h3>
          <button
            type="button"
            className="admin-btn"
            aria-label="Close details"
            onClick={function () {
              setSelectedId("");
              setCvLink(null);
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
          <dt>Current company</dt>
          <dd>{selected.company || "-"}</dd>
          <dt>Job title</dt>
          <dd>{selected.jobTitle}</dd>
          <dt>Skills</dt>
          <dd>{selected.skills}</dd>
          <dt>Years of experience</dt>
          <dd>{selected.experience}</dd>
          <dt>Preferred location</dt>
          <dd>{selected.location}</dd>
          <dt>Applied on</dt>
          <dd>{String(selected.createdAt).slice(0, 10)}</dd>
          <dt>CV</dt>
          <dd>{cvContent}</dd>
        </dl>
      </div>
    );
  }

  let tableContent = null;

  if (loading) {
    tableContent = <p className="loading-state">Loading applications...</p>;
  } else if (loadError) {
    tableContent = <p className="alert alert-error">{loadError}</p>;
  } else if (applications.length === 0) {
    tableContent = <p className="empty-state">No applications to show.</p>;
  } else {
    tableContent = (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Job title</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(function (item) {
            const isDeleting = deleteId === item._id;

            return (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.jobTitle}</td>
                <td>{item.location}</td>
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
                      <span>Delete application and CV?</span>
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
                          openDetails(item._id);
                        }}
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        aria-label={"Delete application from " + item.name}
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
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Job Seekers</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="admin-filter">
        <label htmlFor="job-filter">Show</label>
        <select id="job-filter" value={filter} onChange={handleFilterChange}>
          <option value="All">All applications</option>
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

      <div className="admin-table-wrap">{tableContent}</div>

      {pagination.pages > 1 && (
        <div className="admin-pager">
          <button
            type="button"
            className="admin-btn"
            disabled={page <= 1}
            onClick={function () {
              setPage(page - 1);
            }}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            className="admin-btn"
            disabled={page >= pagination.pages}
            onClick={function () {
              setPage(page + 1);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default JobSeekers;