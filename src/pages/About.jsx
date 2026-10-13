// // src/pages/About.jsx
// import { Link } from "react-router-dom";
// import { Target, Eye, History, Heart } from "lucide-react";

// import SectionTitle from "../components/SectionTitle.jsx";

// // TEMPORARY content. Replace these with the official CTA text.
// // I have not invented any history, dates, or objectives.
// // Anything left empty shows a "will be added soon" message.
// const introText =
//   "Congo Tamil Association brings Tamil families together to keep our language, culture, and friendships alive.";

// const historyText = "";
// const missionText = "";
// const objectives = [];

// // Optional photographs. Add real image URLs or paths, for example "/images/about-1.jpg"
// const aboutPhotos = [];

// function About() {
//   let historyContent = (
//     <p className="empty-state"></p>
//   );
//   if (historyText) {
//     historyContent = <p>{historyText}</p>;
//   }

//   let missionContent = (
//     <p className="empty-state">Our mission will be added soon.</p>
//   );
//   if (missionText) {
//     missionContent = <p>{missionText}</p>;
//   }

//   let objectivesContent = (
//     <p className="empty-state">Our objectives will be added soon.</p>
//   );
//   if (objectives.length > 0) {
//     objectivesContent = (
//       <ul className="about-list">
//         {objectives.map(function (item, index) {
//           return <li key={index}>{item}</li>;
//         })}
//       </ul>
//     );
//   }

//   let photosSection = null;
//   if (aboutPhotos.length > 0) {
//     photosSection = (
//       <section className="section">
//         <div className="container">
//           <SectionTitle title="Our Community" />
//           <div className="grid grid-3">
//             {aboutPhotos.map(function (photoUrl, index) {
//               return (
//                 <img
//                   key={index}
//                   className="about-photo"
//                   src={photoUrl}
//                   alt={"CTA community photo " + (index + 1)}
//                   loading="lazy"
//                 />
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <>
//       <section className="page-header">
//         <div className="container">
//           <h1 className="page-header-title">About CTA</h1>
//           <p className="page-header-text">{introText}</p>
//         </div>
//       </section>

//       {/* History */}
//       <section className="section">
//         <div className="container about-block">
//           <span className="about-icon" aria-hidden="true">
//             <History size={28} />
//           </span>
//           <div className="about-block-content">
//             <SectionTitle title="Our History" align="left" />
//             {historyContent}
//           </div>
//         </div>
//       </section>

//       {/* Mission and objectives */}
//       <section className="section section-alt">
//         <div className="container grid grid-2">
//           <div className="about-card">
//             <span className="about-icon" aria-hidden="true">
//               <Target size={28} />
//             </span>
//             <h2 className="about-card-title">Our Mission</h2>
//             {missionContent}
//           </div>

//           <div className="about-card">
//             <span className="about-icon" aria-hidden="true">
//               <Eye size={28} />
//             </span>
//             <h2 className="about-card-title">Our Objectives</h2>
//             {objectivesContent}
//           </div>
//         </div>
//       </section>

//       {photosSection}

//       {/* Invitation */}
//       <section className="section">
//         <div className="container text-center">
//           <span className="about-icon about-icon-center" aria-hidden="true">
//             <Heart size={28} />
//           </span>
//           <h2>Be part of our community</h2>
//           <p>Send us your details and we will get in touch with you.</p>
//           <Link to="/join-cta" className="btn btn-primary">
//             Join CTA
//           </Link>
//         </div>
//       </section>
//     </>
//   );
// }

// export default About;

import { Link } from "react-router-dom";
import { Target, Eye, History, Heart } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";

const introText =
  "Congo Tamil Association brings Tamil families together to keep our language, culture, and friendships alive.";

const historyText = `காங்கோ தமிழ்ச் சங்கம் (Congo Tamil Association), முன்னர் காங்கோ தமிழ் இளைஞர் பண்பாட்டு மன்றம் (TYCA Congo) என்றழைக்கப்பட்டது.

என்பது காங்கோ வாழ் தமிழர்களால் நடத்தப்படும் ஒரு தமிழ்ச்சங்கம் ஆகும். இது காங்கோ மக்களாட்சிக் குடியரசு தலைநகர் கின்சாசா பெருநகரில் வசிக்கும் காங்கோ தமிழர்கள் ஒன்று சேர்ந்து நடத்தும் தமிழ்ச்சங்கமாகும்.

2011 ஆகத்து இந்திய விடுதலை நாள் கொண்டாட்டத்தோடு ஆரம்பிக்கப்பட்ட இந்த சங்கமானது எண்ணற்ற விழாக்கள், கொண்டாட்டங்கள், இலக்கிய விழாக்கள், தமிழ் முப்பெரும் விழாக்கள், புத்தக வெளியீட்டு விழாக்கள் போன்றவற்றை நடத்தி வருகிறது.

காங்கோ – கின்சாசா வாழ் தமிழ் மக்களை ஒருங்கிணைக்கும் பாலமாக இந்தச் சங்கம் செயற்படுகிறது. அதோடு தமிழ் மொழி, பண்பாடு இவற்றை அடுத்த தலைமுறையினருக்கு கொண்டு செல்லும் விதமாக கின்சாசா வாழ் தமிழர்களின் குழந்தைகளுக்கென்று ஞாயிறு தோறும் காங்கோ தமிழ்ப்பள்ளி செயற்பட்டு வருகிறது.

இங்குள்ள தமிழர்களின் எழுத்தாற்றல் மற்றும் வாசிக்கும் ஆர்வத்தைத் தூண்டும் விதமாக காங்கோ தமிழ்ச்சாரல் என்ற மாத இதழ் மின்னிதழ் வடிவிலும் அச்சு வடிவிலும் வெளியிடப்பட்டது.

தற்போது இவ்விதழ் ஒரிசா பாலு அவர்களின் ஆலோசனையின் படி ஆப்பிரிக்கத் தமிழ்ச்சாரல் என்ற மாத இதழாக ஆப்பிரிக்காவில் வாழும் தமிழ் எழுத்தாளர்களின் பங்களிப்புகளுடன் மின்னிதழாக மட்டும் வெளிவருகிறது.`;

const missionText = "";
const objectives = [];

// Add real image URLs or public paths here.
const aboutPhotos = [ "/images/aboutimg1.jpg"];

function About() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">About CTA</h1>
          <p className="page-header-text">{introText}</p>
        </div>
      </section>

      {/* History */}
      <section className="section">
        <div className="container about-block">
          <span className="about-icon" aria-hidden="true">
            <History size={28} />
          </span>

          <div className="about-block-content">
            <SectionTitle title="Our History" align="left" />
            {historyText ? (
              historyText.split("\n\n").map((paragraph, index) => (
                <p key={index} className="about-history-paragraph">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="empty-state">
                Our history will be added soon.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Mission and objectives
      <section className="section section-alt">
        <div className="container grid grid-2">
          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <Target size={28} />
            </span>
            <h2 className="about-card-title">Our Mission</h2>
            {missionText ? (
              <p>{missionText}</p>
            ) : (
              <p className="empty-state">
                Our mission will be added soon.
              </p>
            )}
          </div>

          <div className="about-card">
            <span className="about-icon" aria-hidden="true">
              <Eye size={28} />
            </span>
            <h2 className="about-card-title">Our Objectives</h2>
            {objectives.length > 0 ? (
              <ul className="about-list">
                {objectives.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">
                Our objectives will be added soon.
              </p>
            )}
          </div>
        </div>
      </section> */}

      {/* Community photos */}
      {aboutPhotos.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle title="Our Community" />
            <div className="grid grid-3">
              {aboutPhotos.map((photoUrl, index) => (
                <img
                        key={index}
                         className="about-photo"
                           src={photoUrl}
                            alt={`CTA community photo ${index + 1}`}
                            loading="lazy"
                   />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Invitation */}
      <section className="section">
        <div className="container text-center">
          <span
            className="about-icon about-icon-center"
            aria-hidden="true"
          >
            <Heart size={28} />
          </span>

          <h2>Be part of our community</h2>
          <p>Send us your details and we will get in touch with you.</p>

          <Link to="/join-cta" className="btn btn-primary">
            Join CTA
          </Link>
        </div>
      </section>
    </>
  );
}

export default About;