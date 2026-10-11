// src/admin/sections/JobSeekers.jsx
import { useState } from "react";
import { Eye, FileText, X } from "lucide-react";

// TEMPORARY sample data (placeholder person, not real applicant data).
// Status changes only affect this page's memory for now.
// Later this list comes from the backend, and the CV link points to a
// protected backend route that checks the admin login before giving the file.
// There are NO analytics or charts here, only the application list.
const startingApplications = [
  {
    _id: "j1",
    name: "Sample Applicant",
    phone: "+000 000 000 000",
    email: "sample@example.com",
    company: "Sample Company",
    jobTitle: "Sample Job Title",
    skills: "Sample skill one, sample skill two",
    experience: 3,
    location: "Sample location",
    cvUrl: "",
    status: "New",
    createdAt: "2026-10-10",
  },
];

const statusOptions = ["New", "Contacted", "Completed"];

function JobSeekers() {
  const [applications, setApplications] = useState(startingApplications);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  function handleStatusChange(id, newStatus) {
    const updated = applications.map(function (item) {
      if (item._id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setApplications(updated);
    setMessage("Status updated to " + newStatus + ".");
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

  const visibleApplications = applications.filter(function (item) {
    if (filter === "All") {
      return true;
    }
    return item.status === filter;
  });

  const selected = applications.find(function (item) {
    return item._id === selectedId;
  });

  let detailPanel = null;
  if (selected) {
    let cvContent = <span>No CV available yet.</span>;
    if (selected.cvUrl) {
      cvContent = (
        <a href={selected.cvUrl} target="_blank" rel="noopener noreferrer">
          <FileText size={16} /> Open CV
        </a>
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
          <dd>{selected.createdAt}</dd>
          <dt>CV</dt>
          <dd>{cvContent}</dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Job Seekers</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-filter">
        <label htmlFor="job-filter">Show</label>
        <select
          id="job-filter"
          value={filter}
          onChange={function (event) {
            setFilter(event.target.value);
          }}
        >
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

      <div className="admin-table-wrap">
        {visibleApplications.length === 0 ? (
          <p className="empty-state">No applications to show.</p>
        ) : (
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
              {visibleApplications.map(function (item) {
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

export default JobSeekers;