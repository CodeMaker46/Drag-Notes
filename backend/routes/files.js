const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const File = require('../models/File');
const User = require('../models/User');
const Folder = require('../models/Folder');
const { cloudinary, storage } = require('../config/cloudinary');

// Configure multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 100 * 1024 * 1024 } // 100MB limit
}).single('file');

// Upload file to folder
router.post('/:folderId', auth, async (req, res) => {
  let uploadedFile = null;
  
  try {
    console.log('Starting file upload process...');
    
    // First check if folder exists
    const folder = await Folder.findById(req.params.folderId);
    if (!folder) {
      console.log('Folder not found:', req.params.folderId);
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Handle file upload using Promise
    uploadedFile = await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.error('Multer upload error:', err);
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              reject(new Error('File size too large. Maximum size is 100MB.'));
            } else {
              reject(new Error(`Upload error: ${err.message}`));
            }
          } else {
            reject(err);
          }
          return;
        }

        if (!req.file) {
          reject(new Error('No file uploaded'));
          return;
        }

        console.log('File uploaded successfully:', {
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path
        });
        resolve(req.file);
      });
    });

    // Create file record in database
    const file = new File({
      name: uploadedFile.originalname,
      cloudinaryUrl: uploadedFile.path,
      publicId: uploadedFile.filename,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedBy: req.user.userId,
      folder: folder._id,
      resourceType: uploadedFile.resourceType || 'raw'
    });

    await file.save();
    console.log('File saved to database:', {
      id: file._id,
      name: file.name,
      url: file.cloudinaryUrl
    });

    // Emit socket event if available
    if (req.app.get('io')) {
      req.app.get('io').emit('file_uploaded', {
        folderId: folder._id,
        course: folder.course,
        branch: folder.branch
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        name: file.name,
        url: file.cloudinaryUrl,
        size: file.size,
        mimeType: file.mimeType
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    
    // Try to delete the file from Cloudinary if it was uploaded
    if (uploadedFile && uploadedFile.filename) {
      try {
        console.log('Attempting to delete failed upload from Cloudinary:', uploadedFile.filename);
        await cloudinary.uploader.destroy(uploadedFile.filename);
      } catch (cloudinaryErr) {
        console.error('Error deleting failed upload from Cloudinary:', cloudinaryErr);
      }
    }

    // Send appropriate error response
    let statusCode = 500;
    let message = 'Error uploading file';

    if (err.message.includes('not found')) {
      statusCode = 404;
      message = err.message;
    } else if (err.message.includes('size too large')) {
      statusCode = 413;
      message = err.message;
    } else if (err.message.includes('api_key')) {
      statusCode = 500;
      message = 'Server configuration error';
      console.error('Cloudinary API key missing or invalid');
    }

    res.status(statusCode).json({
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Download/View file
router.get('/:fileId/download', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.redirect(file.cloudinaryUrl);
  } catch (err) {
    console.error('File download error:', err);
    res.status(500).json({ message: 'Error accessing file' });
  }
});

// Delete file
router.delete('/:folderId/:fileId', auth, async (req, res) => {
  try {
    console.log(`Attempting to delete file ${req.params.fileId} from folder ${req.params.folderId}`);
    
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user is the file uploader
    if (file.uploadedBy.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this file' });
    }

    // Delete file from Cloudinary
    if (file.publicId) {
      console.log(`Deleting file from Cloudinary with publicId: ${file.publicId}`);
      try {
        const result = await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.resourceType || 'raw'
        });
        console.log('Cloudinary deletion result:', result);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Delete file from database
    await File.deleteOne({ _id: file._id });
    console.log('Successfully deleted file from database');

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('File deletion error:', err);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;
