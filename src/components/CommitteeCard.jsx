// src/components/CommitteeCard.jsx

// Each committee member object looks like this (it will come from the admin dashboard later):
// { _id, name, role, year, bio }

function CommitteeCard(props) {
  const member = props.member;

  return (
    <article className="card committee-card">
      <div className="card-body member-body">
        <h3 className="member-name">{member.name}</h3>

        {member.role && <p className="member-role">{member.role}</p>}

        {member.year && <p className="member-year">{member.year}</p>}

        {member.bio && <p className="member-bio">{member.bio}</p>}
      </div>
    </article>
  );
}

export default CommitteeCard;