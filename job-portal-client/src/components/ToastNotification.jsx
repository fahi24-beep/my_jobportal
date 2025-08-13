// Notification.jsx
import { useEffect } from "react";

export default function Notification({ message, type, onClose }) {
  // Auto close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Type-based colors
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div
      className={`px-4 py-3 rounded shadow-lg animate-slide-in ${typeStyles[type] || "bg-gray-800 text-white"}`}
    >
      {message}
    </div>
  );
}
