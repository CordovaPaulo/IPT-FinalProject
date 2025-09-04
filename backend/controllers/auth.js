const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const { getValuesFromToken } = require('../service/jwt');

exports.learnerSignup = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided', code: 401 });
  }

  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  const { age, program, yearLevel, phoneNumber, bio, address, modality, subjects, availability, style, sessionDur, image } = req.body;

  const existingLearner = await Learner.findOne({ id: decoded.id });
  if (existingLearner) {
    return res.status(400).json({ message: 'Learner ID already exists', code: 400 });
  }
  if (!decoded.id || !decoded.username || !decoded.email || !age || !program || !yearLevel || !phoneNumber || !bio || !address || !modality || !subjects || !availability || !style || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }
  let learnerImage = image === null ? "null" : image;
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }
  if (!modality.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400 });
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(availability) || availability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(style) || style.length === 0) {
    return res.status(400).json({ message: 'Style must be a non-empty array', code: 400 });
  }
  if (!sessionDur.includes(sessionDur)) {
    return res.status(400).json({ message: 'Invalid session duration', code: 400 });
  }
  if (!program.includes(program)) {
    return res.status(400).json({ message: 'Invalid program', code: 400 });
  }
  if (!yearLevel.includes(yearLevel)) {
    return res.status(400).json({ message: 'Invalid year level', code: 400 });
  }
  const learner = new Learner({
    userId: decoded.id,
    name: decoded.username,
    email: decoded.email,
    age,
    program,
    yearLevel,
    phoneNumber,
    bio,
    address,
    modality,
    subjects,
    availability,
    style,
    sessionDur,
    image: learnerImage
  });

  await User.updateOne({ _id: decoded.id }, { role: 'learner' });

  await learner.save();
  return res.status(201).json(learner);
};

exports.mentorSignup = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided', code: 401 });
  }

  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  const { age, program, yearLevel, phoneNumber, bio, address, modality, subjects, availability, style, sessionDur, image } = req.body;

  const existingLearner = await Mentor.findOne({ id: decoded.id });
  if (existingLearner) {
    return res.status(400).json({ message: 'Mentor ID already exists', code: 400 });
  }
  if (!decoded.id || !decoded.username || !decoded.email || !age || !program || !yearLevel || !phoneNumber || !bio || !address || !modality || !subjects || !availability || !style || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }
  let mentorImage = image === null ? "null" : image;
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }
  if (!modality.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400 });
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(availability) || availability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(style) || style.length === 0) {
    return res.status(400).json({ message: 'Style must be a non-empty array', code: 400 });
  }
  if (!sessionDur.includes(sessionDur)) {
    return res.status(400).json({ message: 'Invalid session duration', code: 400 });
  }
  if (!program.includes(program)) {
    return res.status(400).json({ message: 'Invalid program', code: 400 });
  }
  if (!yearLevel.includes(yearLevel)) {
    return res.status(400).json({ message: 'Invalid year level', code: 400 });
  }
  const mentor = new Mentor({
    MentorId: decoded.id,
    name: decoded.username,
    email: decoded.email,
    age,
    program,
    yearLevel,
    phoneNumber,
    bio,
    address,
    modality,
    subjects,
    availability,
    style,
    sessionDur,
    image: mentorImage
  });

  await User.updateOne({ _id: decoded.id }, { role: 'mentor' });

  await mentor.save();
  return res.status(201).json(mentor);
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ message: 'Login successful', user: { username: user.username, token } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
