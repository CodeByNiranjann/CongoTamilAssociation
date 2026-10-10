// src/components/HeroBanner.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Each banner object looks like this (it will come from the admin dashboard later):
// { _id, imageUrl, title, description, buttonText, buttonLink }

const SLIDE_TIME = 6000; // 6 seconds

function HeroBanner(props) {
  const banners = props.banners || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-change the slide every few seconds
  useEffect(
    function startAutoSlide() {
      if (banners.length < 2 || isPaused) {
        return;
      }

      const timerId = setInterval(function () {
        setCurrentIndex(function (previousIndex) {
          return (previousIndex + 1) % banners.length;
        });
      }, SLIDE_TIME);

      return function stopAutoSlide() {
        clearInterval(timerId);
      };
    },
    [banners.length, isPaused]
  );

  // Keep the index valid if the number of banners changes
  useEffect(
    function resetIndexIfNeeded() {
      if (currentIndex >= banners.length) {
        setCurrentIndex(0);
      }
    },
    [banners.length, currentIndex]
  );

  function goToNext() {
    setCurrentIndex((currentIndex + 1) % banners.length);
  }

  function goToPrevious() {
    setCurrentIndex((currentIndex - 1 + banners.length) % banners.length);
  }

  // Loading state
  if (props.loading) {
    return (
      <section className="hero hero-empty" aria-busy="true">
        <p className="hero-message">Loading...</p>
      </section>
    );
  }

  // Empty state: no banners yet
  if (banners.length === 0) {
    return (
      <section className="hero hero-empty">
        <div className="container hero-content">
          <h1 className="hero-title">Congo Tamil Association</h1>
          <p className="hero-description">Welcome to our community website.</p>
        </div>
      </section>
    );
  }

  // Builds the optional button (internal link or external link)
  function renderButton(banner) {
    if (!banner.buttonText || !banner.buttonLink) {
      return null;
    }

    const isInternal = banner.buttonLink.startsWith("/");

    if (isInternal) {
      return (
        <Link to={banner.buttonLink} className="btn btn-accent">
          {banner.buttonText}
        </Link>
      );
    }

    return (
      <a
        href={banner.buttonLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-accent"
      >
        {banner.buttonText}
      </a>
    );
  }

  const showControls = banners.length > 1;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={function () {
        setIsPaused(true);
      }}
      onMouseLeave={function () {
        setIsPaused(false);
      }}
    >
      {banners.map(function (banner, index) {
        let slideClass = "hero-slide";
        if (index === currentIndex) {
          slideClass = "hero-slide active";
        }

        let backgroundStyle = {};
        if (banner.imageUrl) {
          backgroundStyle = { backgroundImage: "url(" + banner.imageUrl + ")" };
        }

        return (
          <div
            key={banner._id || index}
            className={slideClass}
            style={backgroundStyle}
            aria-hidden={index !== currentIndex}
          >
            <div className="hero-overlay">
              <div className="container hero-content">
                <h1 className="hero-title">{banner.title}</h1>
                {banner.description && (
                  <p className="hero-description">{banner.description}</p>
                )}
                {renderButton(banner)}
              </div>
            </div>
          </div>
        );
      })}

      {showControls && (
        <>
          <button
            type="button"
            className="hero-arrow hero-arrow-left"
            aria-label="Previous banner"
            onClick={goToPrevious}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            className="hero-arrow hero-arrow-right"
            aria-label="Next banner"
            onClick={goToNext}
          >
            <ChevronRight size={28} />
          </button>

          <div className="hero-dots">
            {banners.map(function (banner, index) {
              let dotClass = "hero-dot";
              if (index === currentIndex) {
                dotClass = "hero-dot active";
              }

              return (
                <button
                  key={"dot-" + index}
                  type="button"
                  className={dotClass}
                  aria-label={"Go to banner " + (index + 1)}
                  onClick={function () {
                    setCurrentIndex(index);
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default HeroBanner;