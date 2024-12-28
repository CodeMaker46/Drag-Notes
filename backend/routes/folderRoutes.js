const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const folderController = require('../controllers/folderController');

// Create a new folder
router.post('/', auth, folderController.createFolder);

// Get all folders for a user
router.get('/', auth, folderController.getFolders);

// Get a specific folder
router.get('/:id', auth, folderController.getFolder);

// Delete a folder
router.delete('/:id', auth, folderController.deleteFolder);

module.exports = router;
