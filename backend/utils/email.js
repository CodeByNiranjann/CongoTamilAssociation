// backend/utils/email.js
import nodemailer from "nodemailer";

// The mail connection is created when first needed, so the server still
// starts if email is not configured yet.
let transporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.CTA_NOTIFICATION_EMAIL
  );
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    // Port 465 uses a secure connection from the start, other ports upgrade it
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

// Removes line breaks so visitor text cannot inject extra email headers
function cleanHeaderText(text) {
  return String(text).replace(/[\r\n]+/g, " ").trim();
}

// Escapes characters so visitor text cannot add HTML to the email
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Sends one email to the CTA notification address.
// It NEVER throws. It returns true if the email was sent, false if not,
// so a mail problem can never lose a saved enquiry.
// options: { subject, lines: [["Label", "value"], ...], replyTo }
export async function sendNotification(options) {
  if (isEmailConfigured() === false) {
    console.error("Email is not configured. Notification was not sent.");
    return false;
  }

  try {
    const textLines = options.lines.map(function (line) {
      return line[0] + ": " + String(line[1]);
    });

    const htmlLines = options.lines.map(function (line) {
      return (
        "<p><strong>" +
        escapeHtml(line[0]) +
        ":</strong> " +
        escapeHtml(line[1]) +
        "</p>"
      );
    });

    const message = {
      from: process.env.SMTP_USER,
      to: process.env.CTA_NOTIFICATION_EMAIL,
      subject: cleanHeaderText(options.subject),
      text: textLines.join("\n"),
      html: htmlLines.join(""),
    };

    if (options.replyTo) {
      message.replyTo = cleanHeaderText(options.replyTo);
    }

    await getTransporter().sendMail(message);
    return true;
  } catch (error) {
    console.error("Could not send the notification email:", error.message);
    return false;
  }
}