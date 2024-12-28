import { useState } from 'react';
import axios from 'axios';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

export default function CreateFolder({ onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate folder name
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in again');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/folders`,
        { name: folderName.trim() },
        { headers: { 'x-auth-token': token } }
      );
      
      setFolderName('');
      if (onFolderCreated) {
        onFolderCreated();
      }
    } catch (err) {
      console.error('Create folder error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error creating folder';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Create New Folder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        
        <div>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            'Create Folder'
          )}
        </button>
      </form>
    </div>
  );
}
