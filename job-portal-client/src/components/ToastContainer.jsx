// ToastContainer.jsx
import PersistentNotification from "./PersistentNotification";

export default function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-4 right-4 flex flex-col space-y-2 z-50">
      {toasts.map(({ id, message, type }) => (
        <PersistentNotification
          key={id}
          text={message}
          type={type}
          onClose={() => onRemove(id)}
        />
      ))}
    </div>
  );
}
