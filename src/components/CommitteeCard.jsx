// src/components/CommitteeCard.jsx
import { User } from "lucide-react";

// { _id, name, role, year, bio, imageUrl }
function CommitteeCard({ member }) {
  return (
    <article className="committee-member-card">
      <div className="committee-avatar-wrap">
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className="committee-avatar"
            loading="lazy"
          />
        ) : (
          <div
            className="committee-avatar-placeholder"
            aria-label={member.name}
          >
            <User size={64} />
          </div>
        )}
      </div>

      <div className="committee-info">
        <p className="committee-role">{member.role}</p>
        <h3 className="committee-name">{member.name}</h3>
        {member.bio && <p className="committee-bio">{member.bio}</p>}
      </div>
    </article>
  );
}

export default CommitteeCard;