// src/components/PublicationCard.jsx
import { BookOpen, Calendar, FileText } from "lucide-react";

// Each publication object looks like this (it will come from the admin dashboard later):
// { _id, title, month, year, description, coverImageUrl, pdfLink }
// "month" is a number from 1 to 12, "year" is a number such as 2026.

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Builds text like "March 2026", "March", or "2026" depending on what is available
function formatMonthYear(month, year) {
  let monthText = "";

  const monthNumber = Number(month);
  if (monthNumber >= 1 && monthNumber <= 12) {
    monthText = monthNames[monthNumber - 1];
  }

  if (monthText && year) {
    return monthText + " " + year;
  }

  if (monthText) {
    return monthText;
  }

  if (year) {
    return String(year);
  }

  return "";
}

function PublicationCard(props) {
  const publication = props.publication;

  const dateText = formatMonthYear(publication.month, publication.year);

  let coverSection = (
    <div className="publication-cover publication-cover-placeholder" aria-hidden="true">
      <BookOpen size={44} />
    </div>
  );

  if (publication.coverImageUrl) {
    coverSection = (
      <img
        className="publication-cover"
        src={publication.coverImageUrl}
        alt={"Cover of " + publication.title}
        loading="lazy"
      />
    );
  }

  return (
    <article className="card publication-card">
      <div className="publication-cover-wrap">{coverSection}</div>

      <div className="card-body">
        <h3 className="card-title">{publication.title}</h3>

        {dateText && (
          <p className="card-meta">
            <Calendar size={16} />
            <span>{dateText}</span>
          </p>
        )}

        {publication.description && (
          <p className="card-text">{publication.description}</p>
        )}

        {publication.pdfLink && (
          <a
            href={publication.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary card-button"
          >
            <FileText size={16} /> Read / Download
          </a>
        )}
      </div>
    </article>
  );
}

export default PublicationCard;