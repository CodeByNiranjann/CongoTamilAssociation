// src/pages/Anthem.jsx
import { useState, useRef } from "react";
import { Play, Pause, Music } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";

// TEMPORARY content. I have not invented the anthem title, words, or audio.
// Put the real details here, for example audioUrl: "/audio/anthem.mp3"
// Later, all of this comes from the admin "CTA Anthem" section.
const sampleAnthem = {
  title: "CTA Anthem",
  description: "",
  audioUrl: "",
};

function Anthem() {
  // Later: replace with data loaded from the backend,
  // and set loading/error from the request.
  const [anthem] = useState(sampleAnthem);
  const [loading] = useState(false);
  const [error] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const audioRef = useRef(null);

  function handlePlayPause() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setAudioError("");

    if (isPlaying) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(function () {
        setAudioError("The audio could not be played. Please try again later.");
        setIsPlaying(false);
      });
    }
  }

  function handlePlay() {
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  function handleAudioError() {
    setAudioError("The audio file could not be loaded.");
    setIsPlaying(false);
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">Loading anthem...</p>
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

  let descriptionContent = null;
  if (anthem.description) {
    descriptionContent = (
      <p className="anthem-description">{anthem.description}</p>
    );
  }

  let playerContent = (
    <p className="empty-state">The anthem audio will be added soon.</p>
  );

  if (anthem.audioUrl) {
    let buttonIcon = <Play size={26} />;
    let buttonLabel = "Play anthem";
    let buttonText = "Play";

    if (isPlaying) {
      buttonIcon = <Pause size={26} />;
      buttonLabel = "Pause anthem";
      buttonText = "Pause";
    }

    playerContent = (
      <div className="anthem-player">
        <audio
          ref={audioRef}
          src={anthem.audioUrl}
          preload="none"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleAudioError}
        />

        <button
          type="button"
          className="btn btn-primary anthem-button"
          aria-label={buttonLabel}
          onClick={handlePlayPause}
        >
          {buttonIcon} {buttonText}
        </button>

        {audioError && <p className="alert alert-error">{audioError}</p>}
      </div>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">CTA Anthem</h1>
          <p className="page-header-text">
            The voice of our community, in song.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="anthem-card">
            <span className="about-icon about-icon-center" aria-hidden="true">
              <Music size={28} />
            </span>
            <SectionTitle title={anthem.title} />
            {descriptionContent}
            {playerContent}
          </div>
        </div>
      </section>
    </>
  );
}

export default Anthem;