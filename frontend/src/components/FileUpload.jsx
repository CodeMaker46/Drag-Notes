import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaCloudUploadAlt } from 'react-icons/fa';

const FileUpload = ({ folderId, onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size too large. Maximum size is 100MB.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/files/${folderId}`,
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
          validateStatus: function (status) {
            return status < 500; // Resolve only if status is less than 500
          }
        }
      );

      if (response.status !== 201) {
        throw new Error(response.data.message || 'Error uploading file');
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setError('');
      }, 1000);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error uploading file';
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [folderId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-300 dark:border-gray-700'}
          ${isUploading ? 'pointer-events-none' : 'hover:border-indigo-500'}
          ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt className={`mx-auto text-4xl mb-2 ${error ? 'text-red-500' : 'text-indigo-500'}`} />
        {isDragActive ? (
          <p className="text-indigo-500">Drop the file here</p>
        ) : (
          <div>
            <p className="mb-1">Drag & drop a file here, or click to select</p>
            <p className="text-sm text-gray-500">Maximum file size: 100MB</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
