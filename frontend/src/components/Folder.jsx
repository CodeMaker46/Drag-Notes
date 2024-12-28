import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import { FaFolder, FaFile, FaTrash, FaPlus, FaArrowLeft, FaUpload } from 'react-icons/fa';

export default function Folder() {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    let timeoutId;
    if (successMessage) {
      timeoutId = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [successMessage]);

  const loadFolders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
        headers: { 'x-auth-token': document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") }
      });
      setFolders(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Load folders error:', err);
      setError(err.response?.data?.message || 'Error loading folders');
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`, {
        headers: { 'x-auth-token': document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") }
      });
      setCurrentFolder(res.data.currentFolder);
      setFolders(res.data.subfolders);
      setFiles(res.data.files);
    } catch (err) {
      console.error('Load folder contents error:', err);
      setError(err.response?.data?.message || 'Error loading folder contents');
    }
  };

  const handleFolderClick = (folder) => {
    loadFolderContents(folder._id);
  };

  const handleBackClick = async () => {
    if (!currentFolder?.parentFolder) {
      loadFolders();
      setCurrentFolder(null);
      setFiles([]);
    } else {
      loadFolderContents(currentFolder.parentFolder);
    }
  };

  const createFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        setError('Folder name is required');
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/folders`, {
        name: newFolderName.trim(),
        course: user.course,
        branch: user.branch,
        parentFolderId: currentFolder?._id || null
      }, {
        headers: { 'x-auth-token': document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") }
      });

      if (currentFolder) {
        loadFolderContents(currentFolder._id);
      } else {
        loadFolders();
      }

      setNewFolderName('');
      setShowNewFolderModal(false);
      setSuccessMessage('Folder created successfully');
      setError('');
    } catch (err) {
      console.error('Create folder error:', err);
      setError(err.response?.data?.message || 'Error creating folder');
      setSuccessMessage('');
    }
  };

  const deleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its contents?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
        headers: { 'x-auth-token': document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") }
      });

      if (currentFolder) {
        if (currentFolder._id === folderId) {
          handleBackClick();
        } else {
          loadFolderContents(currentFolder._id);
        }
      } else {
        loadFolders();
      }
      
      setSuccessMessage('Folder deleted successfully');
      setError('');
    } catch (err) {
      console.error('Delete folder error:', err);
      setError(err.response?.data?.message || 'Error deleting folder');
      setSuccessMessage('');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          {currentFolder && (
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
          )}
          <span className="text-lg font-semibold">
            {currentFolder ? currentFolder.name : 'All Folders'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowNewFolderModal(true);
              clearMessages();
            }}
            className="flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
          >
            <FaPlus className="mr-2" />
            New Folder
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} type="error" />}
      {successMessage && <ErrorMessage message={successMessage} type="success" />}

      {/* Main content area */}
      <div className="p-6">
        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {folders.map(folder => (
            <div
              key={folder._id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer group"
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaFolder className="text-2xl text-indigo-400" />
                  <span className="font-medium truncate">{folder.name}</span>
                </div>
                {folder.createdBy === user.userId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder._id);
                    }}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Created by: {folder.createdBy?.email || 'Unknown'}
              </div>
            </div>
          ))}
        </div>

        {/* Files Grid */}
        {currentFolder && (
          <div className="space-y-6">
            <FileUpload
              folderId={currentFolder._id}
              onUploadComplete={() => loadFolderContents(currentFolder._id)}
              onError={(errorMessage) => {
                setError(errorMessage);
                setSuccessMessage('');
              }}
            />
            
            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map(file => (
                  <div
                    key={file._id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaFile className="text-2xl text-gray-400" />
                        <span className="font-medium truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={file.cloudinaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <FaUpload className="transform rotate-180" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      Size: {Math.round(file.size / 1024)} KB
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      Uploaded by: {file.uploadedBy?.email || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create folder modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  clearMessages();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
