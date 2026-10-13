// src/admin/UploadField.jsx
import { useState } from "react";
import { Upload } from "lucide-react";

import { apiPost } from "../api.js";

// Props: id, label, kind ("image" | "audio" | "pdf"), value, onChange(url),
//        error (text), showLink (default true: shows the link box too)

const acceptTypes = {
  image: ".jpg,.jpeg,.png,.webp",
  audio: ".mp3,.wav",
  pdf: ".pdf",
};

const maxSizesMB = {
  image: 5,
  audio: 15,
  pdf: 10,
};

function UploadField(props) {
  const kind = props.kind || "image";
  const showLink = props.showLink !== false;
  const value = props.value || "";

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [inputKey, setInputKey] = useState(0);

  async function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setUploadError("");

    if (file.size > maxSizesMB[kind] * 1024 * 1024) {
      setUploadError("The file must be " + maxSizesMB[kind] + " MB or smaller.");
      setInputKey(inputKey + 1);
      return;
    }

    const body = new FormData();
    body.append("file", file);

    setUploading(true);

    try {
      const result = await apiPost("/uploads/" + kind, body, true);
      props.onChange(result.url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      setInputKey(inputKey + 1);
    }
  }

  function handleLinkChange(event) {
    props.onChange(event.target.value);
  }

  let linkId = props.id;
  let fileId = props.id + "-file";
  if (showLink === false) {
    linkId = "";
    fileId = props.id;
  }

  let buttonText = "Upload file";
  if (uploading) {
    buttonText = "Uploading...";
  }

  let preview = null;
  if (value && kind === "image") {
    preview = <img className="upload-preview" src={value} alt="Preview" />;
  }
  if (value && kind === "audio") {
    preview = <audio className="admin-audio" controls src={value}></audio>;
  }
  if (value && kind === "pdf") {
    preview = (
      <a href={value} target="_blank" rel="noopener noreferrer">
        Open current file
      </a>
    );
  }

  return (
    <div className="admin-field">
      <label htmlFor={showLink ? linkId : fileId}>{props.label}</label>

      {showLink && (
        <input
          id={linkId}
          type="text"
          placeholder="Paste a link, or upload a file below"
          value={value}
          onChange={handleLinkChange}
          aria-invalid={props.error ? "true" : "false"}
        />
      )}

      <div className="upload-row">
        <label className="admin-btn upload-button">
          <Upload size={16} /> {buttonText}
          <input
            key={inputKey}
            id={fileId}
            className="upload-input"
            type="file"
            accept={acceptTypes[kind]}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        <span className="admin-hint">Max {maxSizesMB[kind]} MB</span>
      </div>

      {uploadError && <span className="admin-error">{uploadError}</span>}
      {props.error && <span className="admin-error">{props.error}</span>}
      {preview}
    </div>
  );
}

export default UploadField;