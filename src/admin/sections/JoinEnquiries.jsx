// src/admin/sections/JoinEnquiries.jsx
import { useState, useEffect } from "react";
import { Eye, X, Trash2 } from "lucide-react";

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

function JoinEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(
    function loadEnquiries() {
      let isCancelled = false;

      async function fetchEnquiries() {
        setLoading(true);
        setLoadError("");

        let path = "/join-enquiries?page=" + page + "&limit=20";
        if (filter !== "All") {
          path = path + "&status=" + filter;
        }

        try {
          const result = await apiGet(path, true);

          if (isCancelled === false) {
            setEnquiries(result.data);
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

      fetchEnquiries();

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
  }

  async function handleStatusChange(id, newStatus) {
    setMessage("");
    setServerError("");

    try {
      const result = await apiPut(
        "/join-enquiries/" + id + "/status",
        { status: newStatus },
        true
      );

      setEnquiries(
        enquiries.map(function (item) {
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

  async function confirmDelete(id) {
    setMessage("");
    setServerError("");

    try {
      await apiDelete("/join-enquiries/" + id, true);

      setEnquiries(
        enquiries.filter(function (item) {
          return item._id !== id;
        })
      );
      setMessage("Enquiry deleted.");

      if (selectedId === id) {
        setSelectedId("");
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeleteId("");
    }
  }

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
          <dd>{String(selected.createdAt).slice(0, 10)}</dd>
          <dt>Notification email</dt>
          <dd>{selected.emailStatus}</dd>
        </dl>
      </div>
    );
  }

  let tableContent = null;

  if (loading) {
    tableContent = <p className="loading-state">Loading enquiries...</p>;
  } else if (loadError) {
    tableContent = <p className="alert alert-error">{loadError}</p>;
  } else if (enquiries.length === 0) {
    tableContent = <p className="empty-state">No enquiries to show.</p>;
  } else {
    tableContent = (
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
          {enquiries.map(function (item) {
            const isDeleting = deleteId === item._id;

            return (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{String(item.createdAt).slice(0, 10)}</td>
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
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Join CTA Enquiries</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="admin-filter">
        <label htmlFor="enquiry-filter">Show</label>
        <select id="enquiry-filter" value={filter} onChange={handleFilterChange}>
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

export default JoinEnquiries;