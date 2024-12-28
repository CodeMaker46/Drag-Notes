const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Folder = require('../models/Folder');
const File = require('../models/File');
const { cloudinary } = require('../config/cloudinary');

// Get all root folders for user
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ 
      createdBy: req.user.userId,
      parentFolder: null
    }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error('Error getting folders:', err);
    res.status(500).json({ message: 'Error getting folders' });
  }
});

// Get folder contents (subfolders and files)
router.get('/:folderId/contents', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Get subfolders
    const subfolders = await Folder.find({
      parentFolder: folder._id
    }).sort({ name: 1 });

    // Get files
    const files = await File.find({
      folder: folder._id
    }).sort({ createdAt: -1 });

    res.json({
      currentFolder: folder,
      subfolders,
      files
    });
  } catch (err) {
    console.error('Error getting folder contents:', err);
    res.status(500).json({ message: 'Error getting folder contents' });
  }
});

// Create new folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, course, branch, parentFolderId } = req.body;

    // Validate input
    if (!name || !course || !branch) {
      return res.status(400).json({ message: 'Please provide name, course, and branch' });
    }

    let path = name;
    let parentFolder = null;

    // If creating a subfolder, verify parent folder and build path
    if (parentFolderId) {
      parentFolder = await Folder.findById(parentFolderId);
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      
      // Check if user has access to parent folder
      if (parentFolder.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to create folder here' });
      }

      path = `${parentFolder.path}/${name}`;
    }

    // Check if folder already exists at this path
    const existingFolder = await Folder.findOne({
      name,
      course,
      branch,
      parentFolder: parentFolderId || null,
      createdBy: req.user.userId
    });

    if (existingFolder) {
      return res.status(400).json({ message: 'Folder already exists' });
    }

    // Create new folder
    const folder = new Folder({
      name,
      course,
      branch,
      createdBy: req.user.userId,
      parentFolder: parentFolderId || null,
      path
    });

    await folder.save();

    // If socket.io is available, emit event
    if (req.app.get('io')) {
      req.app.get('io').emit('folder_created', {
        folder,
        course,
        branch
      });
    }

    res.status(201).json(folder);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ message: 'Error creating folder' });
  }
});

// Delete folder and its contents
router.delete('/:folderId', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if user owns the folder
    if (folder.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this folder' });
    }

    // Get all subfolders recursively
    async function getAllSubfolders(folderId) {
      const subfolders = await Folder.find({ parentFolder: folderId });
      let allFolders = [folderId];
      for (const subfolder of subfolders) {
        const childFolders = await getAllSubfolders(subfolder._id);
        allFolders = allFolders.concat(childFolders);
      }
      return allFolders;
    }

    const folderIds = await getAllSubfolders(folder._id);

    // Delete all files in all folders
    for (const folderId of folderIds) {
      const files = await File.find({ folder: folderId });
      for (const file of files) {
        try {
          if (file.publicId) {
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: file.resourceType || 'raw'
            });
          }
          await File.deleteOne({ _id: file._id });
        } catch (error) {
          console.error(`Error deleting file ${file._id}:`, error);
        }
      }
    }

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: folderIds } });

    // Emit socket event if available
    if (req.app.get('io')) {
      req.app.get('io').emit('folder_deleted', {
        folderId: folder._id,
        course: folder.course,
        branch: folder.branch
      });
    }

    res.json({ message: 'Folder and contents deleted successfully' });
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({ message: 'Error deleting folder' });
  }
});

module.exports = router;
