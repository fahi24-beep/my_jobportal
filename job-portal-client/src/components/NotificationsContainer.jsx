import PersistentNotification from "./PersistentNotification";

export default function NotificationsContainer({ notifications, onRemove }) {
  return (
    <div className="max-w-sm w-full space-y-2">
      {notifications.map((n) => (
        <PersistentNotification
          key={n.id}
          text={n.text}
          read={n.read}
          onClose={() => onRemove(n.id)}
        />
      ))}
    </div>
  );
}

