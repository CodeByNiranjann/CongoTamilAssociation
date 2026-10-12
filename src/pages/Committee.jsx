// src/pages/Committee.jsx
import { useState, useEffect } from "react";

import SectionTitle from "../components/SectionTitle.jsx";
import CommitteeCard from "../components/CommitteeCard.jsx";
import { apiGet } from "../api.js";

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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function loadCommittee() {
    let isCancelled = false;

    async function fetchMembers() {
      try {
        const result = await apiGet("/committee");

        if (isCancelled === false) {
          setMembers(result.data);
        }
      } catch (err) {
        if (isCancelled === false) {
          setError(err.message);
        }
      } finally {
        if (isCancelled === false) {
          setLoading(false);
        }
      }
    }

    fetchMembers();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

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