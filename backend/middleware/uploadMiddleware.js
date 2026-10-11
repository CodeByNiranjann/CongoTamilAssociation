// backend/middleware/uploadMiddleware.js
import multer from "multer";

// Files are kept in memory only, then sent to Cloudinary by the controller.
// Nothing is written to the server disk.
const storage = multer.memoryStorage();

const MB = 1024 * 1024;

// Each file type: allowed extensions, allowed MIME types, and max size.
// The "magic bytes" check below also looks at the real file content,
// because the file name and MIME type sent by the browser can be faked.
const fileRules = {
  image: {
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * MB,
    label: "JPG, PNG or WEBP image",
  },
  audio: {
    extensions: ["mp3", "wav"],
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave"],
    maxSize: 15 * MB,
    label: "MP3 or WAV audio file",
  },
  pdf: {
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    maxSize: 10 * MB,
    label: "PDF file",
  },
  cv: {
    extensions: ["pdf", "doc", "docx"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 5 * MB,
    label: "PDF, DOC or DOCX file",
  },
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getExtension(fileName) {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1].toLowerCase();
}

// Builds a Multer upload handler for one single file field.
// kind: "image", "audio", "pdf" or "cv"
// fieldName: the form field name, for example "image" or "cv"
export function uploadSingle(kind, fieldName) {
  const rule = fileRules[kind];

  const upload = multer({
    storage: storage,
    limits: { fileSize: rule.maxSize, files: 1 },
    fileFilter: function (req, file, callback) {
      const extension = getExtension(file.originalname);

      if (rule.extensions.includes(extension) === false) {
        return callback(createError("Please upload a " + rule.label + ".", 400));
      }

      if (rule.mimeTypes.includes(file.mimetype) === false) {
        return callback(createError("Please upload a " + rule.label + ".", 400));
      }

      callback(null, true);
    },
  }).single(fieldName);

  return function (req, res, next) {
    upload(req, res, function (error) {
      if (error) {
        return next(error);
      }
      next();
    });
  };
}

// Checks the first bytes of the uploaded file to confirm it really is
// the type it claims to be. Use it AFTER uploadSingle, on routes where
// the file is required or optional.
export function verifyFileContent(kind) {
  return function (req, res, next) {
    // No file uploaded: nothing to check (the controller decides if it is required)
    if (!req.file) {
      return next();
    }

    const bytes = req.file.buffer;
    let isValid = false;

    if (kind === "image") {
      const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const isPng =
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      const isWebp =
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP";
      isValid = isJpeg || isPng || isWebp;
    }

    if (kind === "audio") {
      const isMp3 =
        bytes.toString("ascii", 0, 3) === "ID3" ||
        (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
      const isWav =
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WAVE";
      isValid = isMp3 || isWav;
    }

    if (kind === "pdf") {
      isValid = bytes.toString("ascii", 0, 5) === "%PDF-";
    }

    if (kind === "cv") {
      const isPdf = bytes.toString("ascii", 0, 5) === "%PDF-";
      // .docx files are ZIP archives and start with "PK"
      const isDocx = bytes[0] === 0x50 && bytes[1] === 0x4b;
      // Old .doc files start with the OLE signature D0 CF 11 E0
      const isDoc =
        bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
      isValid = isPdf || isDocx || isDoc;
    }

    if (isValid === false) {
      return next(
        createError("The file content does not match its type. Please upload a real " + fileRules[kind].label + ".", 400)
      );
    }

    next();
  };
}

// Returns the safe extension (lowercase) of the uploaded file, for storage names
export function getFileExtension(file) {
  return getExtension(file.originalname);
}