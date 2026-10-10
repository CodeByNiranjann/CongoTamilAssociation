// src/components/Notification.jsx
import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

// Props:
//   type: "success", "error" or "info" (default "info")
//   message: the text to show (nothing is shown if empty)
//   onClose: function called when the notification is closed
//   autoHide: number of milliseconds before it closes by itself (optional, 0 = never)

function Notification(props) {
  const message = props.message;
  const onClose = props.onClose;
  const autoHide = props.autoHide || 0;

  let type = "info";
  if (props.type === "success" || props.type === "error") {
    type = props.type;
  }

  // Close automatically after a few seconds, if autoHide is set
  useEffect(
    function startAutoHide() {
      if (!message || !autoHide || !onClose) {
        return;
      }

      const timerId = setTimeout(function () {
        onClose();
      }, autoHide);

      return function stopAutoHide() {
        clearTimeout(timerId);
      };
    },
    [message, autoHide, onClose]
  );

  if (!message) {
    return null;
  }

  let icon = <Info size={20} />;
  if (type === "success") {
    icon = <CheckCircle size={20} />;
  }
  if (type === "error") {
    icon = <AlertCircle size={20} />;
  }

  // Errors are announced immediately, other messages politely
  let role = "status";
  if (type === "error") {
    role = "alert";
  }

  return (
    <div className={"notification notification-" + type} role={role}>
      <span className="notification-icon" aria-hidden="true">
        {icon}
      </span>

      <p className="notification-message">{message}</p>

      {onClose && (
        <button
          type="button"
          className="notification-close"
          aria-label="Close notification"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default Notification;