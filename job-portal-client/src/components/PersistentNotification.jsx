// src/components/Notification.jsx
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Notification({ text, read, onClose }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg shadow-md border ${
        read
          ? "bg-white border-gray-200"
          : "bg-blue-50 border-blue-300"
      }`}
    >
      {/* Left side: Unread dot + text */}
      <div className="flex items-center space-x-3">
        {!read && (
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
        )}
        <p
          className={`text-sm ${
            read ? "text-gray-700" : "text-gray-900 font-semibold"
          }`}
        >
          {text}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
