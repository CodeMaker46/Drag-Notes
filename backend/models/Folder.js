const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
folderSchema.index({ name: 1, course: 1, branch: 1, createdBy: 1, parentFolder: 1 }, { unique: true });
folderSchema.index({ path: 1 });

module.exports = mongoose.model('Folder', folderSchema);
