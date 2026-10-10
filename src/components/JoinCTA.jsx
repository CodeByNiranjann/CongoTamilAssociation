// src/components/JoinCTA.jsx
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

// Optional props: title, text, buttonText
// This is the call-to-action section. The membership form is on the /join-cta page.

function JoinCTA(props) {
  let title = "Become a part of CTA";
  if (props.title) {
    title = props.title;
  }

  let text = "Be part of our Tamil community. Send us your details and we will get in touch with you.";
  if (props.text) {
    text = props.text;
  }

  let buttonText = "Join CTA";
  if (props.buttonText) {
    buttonText = props.buttonText;
  }

  return (
    <section className="join-cta">
      <div className="container join-cta-inner">
        <span className="join-cta-icon" aria-hidden="true">
          <Users size={34} />
        </span>

        <div className="join-cta-content">
          <h2 className="join-cta-title">{title}</h2>
          <p className="join-cta-text">{text}</p>
        </div>

        <Link to="/join-cta" className="btn btn-accent join-cta-button">
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

export default JoinCTA;