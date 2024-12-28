import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Folder from '../components/Folder';

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      // Cleanup on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.email}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Course: {user?.course} | Branch: {user?.branch}
              </p>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Recent Notifications
              </h2>
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="p-2 bg-blue-50 text-blue-700 rounded"
                  >
                    {notification.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          <div className="bg-white rounded-lg shadow">
            <Folder />
          </div>
        </div>
      </main>
    </div>
  );
}
