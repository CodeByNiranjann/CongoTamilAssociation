// src/pages/Committee.jsx
import { useState } from "react";
import SectionTitle from "../components/SectionTitle.jsx";
import CommitteeCard from "../components/CommitteeCard.jsx";

// TEMPORARY sample data (placeholder names, not real CTA members).
// This is replaced by a real API call when the backend is ready.
const sampleMembers = [
  {
    _id: "m1",
    name: "Sample Member One",
    role: "Sample Role",
    year: "2026",
    bio: "This is sample text. Real members come from the admin dashboard.",
  },
  {
    _id: "m2",
    name: "Sample Member Two",
    role: "Sample Role",
    year: "2026",
    bio: "",
  },
  {
    _id: "m3",
    name: "Sample Member Three",
    role: "Sample Role",
    year: "2025",
    bio: "",
  },
];

// Groups members by year and returns years sorted from newest to oldest
function groupMembersByYear(members) {
  const groups = {};

  members.forEach(function (member) {
    const year = member.year || "Other";

    if (!groups[year]) {
      groups[year] = [];
    }

    groups[year].push(member);
  });

  const years = Object.keys(groups).sort(function (a, b) {
    return b.localeCompare(a);
  });

  return years.map(function (year) {
    return { year: year, members: groups[year] };
  });
}

function Committee() {
  // Later: replace with data from the backend, and set loading/error from the request
  const [members] = useState(sampleMembers);
  const [loading] = useState(false);
  const [error] = useState("");

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">Loading committee...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <p className="alert alert-error">{error}</p>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <SectionTitle title="Our Committee" />
          <p className="empty-state">Committee details will be added soon.</p>
        </div>
      </section>
    );
  }

  const groups = groupMembersByYear(members);

  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          title="Our Committee"
          subtitle="The people who serve our community"
        />

        {groups.map(function (group, index) {
          let heading = "Committee " + group.year;
          if (index === 0) {
            heading = "Current Committee " + group.year;
          }

          return (
            <div key={group.year} className="committee-group">
              <h3 className="committee-year">{heading}</h3>
              <div className="grid grid-3">
                {group.members.map(function (member) {
                  return <CommitteeCard key={member._id} member={member} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Committee;