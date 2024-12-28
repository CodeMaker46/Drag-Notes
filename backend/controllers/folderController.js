const Folder = require('../models/Folder');
const User = require('../models/User');

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Get user's course and branch
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const folder = new Folder({
      name,
      owner: req.user.userId,
      course: user.course,
      branch: user.branch
    });

    await folder.save();

    // Notify users in the same course and branch
    if (global.io) {
      const notification = {
        type: 'NEW_FOLDER',
        message: `New folder "${name}" created in ${user.course} - ${user.branch}`,
        folder: folder._id,
        createdBy: user.email
      };

      global.io.to(`${user.course}-${user.branch}`).emit('notification', notification);
    }

    res.status(201).json(folder);
  } catch (err) {
    console.error('Create folder error:', err);
    res.status(500).json({ message: 'Error creating folder' });
  }
};

// Get all folders for a user
exports.getFolders = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const folders = await Folder.find({
      $or: [
        { owner: req.user.userId },
        { sharedWith: req.user.userId }
      ]
    }).populate('owner', 'email');

    // Separate folders into owned and shared
    const ownedFolders = folders.filter(folder => folder.owner._id.toString() === req.user.userId);
    const sharedFolders = folders.filter(folder => folder.owner._id.toString() !== req.user.userId);

    res.json({
      owned: ownedFolders,
      shared: sharedFolders
    });
  } catch (err) {
    console.error('Get folders error:', err);
    res.status(500).json({ message: 'Error getting folders' });
  }
};

// Get a specific folder
exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('owner', 'email')
      .populate('files');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if user has access to the folder
    const canAccess = 
      folder.owner._id.toString() === req.user.userId ||
      folder.sharedWith.includes(req.user.userId);

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(folder);
  } catch (err) {
    console.error('Get folder error:', err);
    res.status(500).json({ message: 'Error getting folder' });
  }
};

// Delete a folder
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Only owner can delete the folder
    if (folder.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the owner can delete this folder' });
    }

    await folder.remove();

    // Notify users in the same course and branch
    if (global.io) {
      const user = await User.findById(req.user.userId);
      const notification = {
        type: 'FOLDER_DELETED',
        message: `Folder "${folder.name}" was deleted from ${folder.course} - ${folder.branch}`,
        folderName: folder.name,
        deletedBy: user.email
      };

      global.io.to(`${folder.course}-${folder.branch}`).emit('notification', notification);
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('Delete folder error:', err);
    res.status(500).json({ message: 'Error deleting folder' });
  }
};
