const mongoose = require('mongoose');

const branchesPerCourse = {
  'B.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE', 'ICE', 'MPAE', 'BT'],
  'M.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE'],
  'MBA': ['General', 'Finance', 'Marketing'],
  'BBA': ['General', 'Finance', 'Marketing'],
  'Ph.D': ['CSE', 'IT', 'ECE', 'EEE', 'MAE']
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /@nsut\.ac\.in$/.test(v);
      },
      message: props => `${props.value} is not a valid NSUT email address!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  course: {
    type: String,
    required: true,
    enum: {
      values: Object.keys(branchesPerCourse),
      message: '{VALUE} is not a valid course'
    }
  },
  branch: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return branchesPerCourse[this.course]?.includes(v);
      },
      message: props => `${props.value} is not a valid branch for the selected course`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
