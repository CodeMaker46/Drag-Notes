const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Folder = require('../models/Folder');
const File = require('../models/File');
const { cloudinary } = require('../config/cloudinary');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete account
router.delete('/delete-account', auth, async (req, res) => {
  try {
    console.log('Starting account deletion process for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all folders created by the user
    const folders = await Folder.find({ createdBy: user._id });
    console.log(`Found ${folders.length} folders to delete`);

    for (const folder of folders) {
      // Delete all files in the folder
      const files = await File.find({ folder: folder._id });
      console.log(`Found ${files.length} files in folder ${folder._id}`);

      for (const file of files) {
        try {
          // Delete file from Cloudinary
          if (file.publicId) {
            console.log(`Deleting file from Cloudinary: ${file.publicId}`);
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: file.resourceType || 'raw'
            });
          }

          // Delete file record from database
          await File.deleteOne({ _id: file._id });
          console.log(`Deleted file: ${file._id}`);
        } catch (fileErr) {
          console.error(`Error deleting file ${file._id}:`, fileErr);
          // Continue with other files even if one fails
        }
      }

      // Delete folder
      await Folder.deleteOne({ _id: folder._id });
      console.log(`Deleted folder: ${folder._id}`);
    }

    // Delete user
    await User.deleteOne({ _id: user._id });
    console.log('User account deleted successfully');

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ 
      message: 'Error deleting account',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
