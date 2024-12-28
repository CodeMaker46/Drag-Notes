export default function NotificationList({ notifications }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">No notifications yet</p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm text-gray-600">{notification.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
