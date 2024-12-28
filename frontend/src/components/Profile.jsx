import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

export default function Profile() {
  const { user, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <div className="mt-1 text-lg">{user?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Course</label>
              <div className="mt-1 text-lg">{user?.course}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Branch</label>
              <div className="mt-1 text-lg">{user?.branch}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Account Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Delete Account</h3>
              <p className="mb-4 text-gray-400">
                Are you sure you want to delete your account? This action cannot be undone and will:
              </p>
              <ul className="list-disc list-inside mb-4 text-gray-400">
                <li>Delete all your folders and files</li>
                <li>Remove your access to shared folders</li>
                <li>Permanently delete your account information</li>
              </ul>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
