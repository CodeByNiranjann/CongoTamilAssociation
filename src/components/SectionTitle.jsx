// src/components/SectionTitle.jsx

// Props: title (required), subtitle (optional), align ("center" or "left")
function SectionTitle(props) {
  let wrapperClass = "section-title";
  if (props.align === "left") {
    wrapperClass = "section-title section-title-left";
  }

  return (
    <div className={wrapperClass}>
      <h2 className="section-title-text">{props.title}</h2>
      <span className="section-title-line" aria-hidden="true"></span>
      {props.subtitle && (
        <p className="section-title-subtitle">{props.subtitle}</p>
      )}
    </div>
  );
}

export default SectionTitle;