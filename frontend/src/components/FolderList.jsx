import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaFolder, FaFolderOpen, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

export default function FolderList({ folders, onFolderUpdate, onFolderSelect, selectedFolderId }) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/folders`,
        { name: newFolderName },
        { headers: { 'x-auth-token': token } }
      );
      setNewFolderName('');
      setIsCreating(false);
      setError('');
      onFolderUpdate();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.response?.data?.message || 'Error creating folder');
    }
  };

  const deleteFolder = async (folderId, e) => {
    e.stopPropagation(); // Prevent folder selection when clicking delete
    if (!window.confirm('Are you sure you want to delete this folder? All contents will be permanently deleted.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/folders/${folderId}`,
        { headers: { 'x-auth-token': token } }
      );
      onFolderUpdate();
      if (selectedFolderId === folderId) {
        onFolderSelect(null);
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      alert(err.response?.data?.message || 'Error deleting folder');
    }
  };

  const userFolders = folders.filter(f => f.createdBy._id === user._id);
  const sharedFolders = folders.filter(f => f.createdBy._id !== user._id);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      {/* Create Folder Section */}
      <div className="mb-6">
        {isCreating ? (
          <form onSubmit={createFolder} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewFolderName('');
                  setError('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <FaPlus />
            <span>Create New Folder</span>
          </button>
        )}
      </div>

      {/* My Folders List */}
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-gray-500 mb-2">MY FOLDERS ({userFolders.length})</h2>
        {userFolders.map((folder) => (
          <div key={folder._id} className="flex items-center group">
            <button
              onClick={() => onFolderSelect(folder._id)}
              className={`flex-1 flex items-center space-x-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                selectedFolderId === folder._id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {selectedFolderId === folder._id ? (
                <FaFolderOpen className="text-blue-500" />
              ) : (
                <FaFolder className="text-gray-400" />
              )}
              <span className="truncate">{folder.name}</span>
            </button>
            <button
              onClick={(e) => deleteFolder(folder._id, e)}
              className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete folder"
            >
              <FaTrash />
            </button>
          </div>
        ))}

        {/* Shared Folders List */}
        {sharedFolders.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-gray-500 mt-6 mb-2">
              SHARED FOLDERS ({sharedFolders.length})
            </h2>
            {sharedFolders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => onFolderSelect(folder._id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                  selectedFolderId === folder._id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {selectedFolderId === folder._id ? (
                  <FaFolderOpen className="text-blue-500" />
                ) : (
                  <FaFolder className="text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{folder.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    by {folder.createdBy.name || folder.createdBy.email} ({folder.course} - {folder.branch})
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
