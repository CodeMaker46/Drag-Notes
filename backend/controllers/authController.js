const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateEmail = (email) => {
  const nsutEmailRegex = /@nsut\.ac\.in$/;
  return nsutEmailRegex.test(email);
};

exports.register = async (req, res) => {
  try {
    const { email, password, course, branch } = req.body;

    // Validate NSUT email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email address',
        error: 'Email must be a valid NSUT email address (@nsut.ac.in)'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email address already exists'
      });
    }

    // Validate course and branch
    const validCourses = ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'Ph.D'];
    const validBranches = ['CSE', 'IT', 'ECE', 'EEE', 'MAE', 'ICE', 'MPAE', 'BT'];

    if (!validCourses.includes(course)) {
      return res.status(400).json({
        message: 'Invalid course selection'
      });
    }

    if (!validBranches.includes(branch)) {
      return res.status(400).json({
        message: 'Invalid branch selection'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      course,
      branch
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Join course and branch rooms
    if (global.io) {
      global.io.in(user._id).socketsJoin(`${course}`);
      global.io.in(user._id).socketsJoin(`${course}-${branch}`);
    }

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        course: user.course,
        branch: user.branch
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate NSUT email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email address',
        error: 'Email must be a valid NSUT email address (@nsut.ac.in)'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Join course and branch rooms
    if (global.io) {
      global.io.in(user._id).socketsJoin(`${user.course}`);
      global.io.in(user._id).socketsJoin(`${user.course}-${user.branch}`);
    }

    // Return user data and token
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        course: user.course,
        branch: user.branch
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Error getting user data' });
  }
};
