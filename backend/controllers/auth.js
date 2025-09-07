const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const { getValuesFromToken } = require('../service/jwt');
const uploadController = require('./upload');
const cloudinary = require('../service/cloudinary');


exports.learnerSignup = async (req, res) => {

  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  // Handle profile picture upload if file is present
  let learnerImage = null;
  if (req.file) {
    try {
      const result = await uploadController.upToCloudinary(req, {
        status: () => ({ json: () => {} }),
        json: () => {},
      });
      // upToCloudinary sends the response, so instead call the upload logic directly or refactor to return the result
      // For now, let's call the upload logic directly:
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          require('streamifier').createReadStream(buffer).pipe(stream);
        });
      };
      const uploadResult = await streamUpload(req.file.buffer);
      learnerImage = uploadResult.secure_url;
    } catch (err) {
      return res.status(500).json({ message: 'Image upload failed', code: 500 });
    }
  } else {
    learnerImage = req.body.image === null ? "null" : req.body.image;
  }

  // Parse fields from req.body (FormData sends all as strings)
  const {
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
    sessionDur
  } = req.body;

  // Parse arrays if sent as JSON strings
  const parsedSubjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
  const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
  const parsedStyle = typeof style === 'string' ? JSON.parse(style) : style;

  const existingLearner = await Learner.findOne({ id: decoded.id });
  if (existingLearner) {
    return res.status(400).json({ message: 'Learner ID already exists', code: 400 });
  }
  if (!decoded.id || !decoded.username || !decoded.email || !age || !program || !yearLevel || !phoneNumber || !bio || !address || !modality || !parsedSubjects || !parsedAvailability || !parsedStyle || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400, missing: {decoded, age, program, yearLevel, phoneNumber, bio, address, modality, parsedSubjects, parsedAvailability, parsedStyle, sessionDur} });
  }
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }
  if (!modality.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400 });
  }
  if (!Array.isArray(parsedSubjects) || parsedSubjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedAvailability) || parsedAvailability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedStyle) || parsedStyle.length === 0) {
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
    subjects: parsedSubjects,
    availability: parsedAvailability,
    style: parsedStyle,
    sessionDur,
    image: learnerImage
  });

  await User.updateOne({ _id: decoded.id }, { role: 'learner' });

  await learner.save();
  return res.status(201).json(learner);
};

exports.mentorSignup = async (req, res) => {

  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  // Handle profile picture upload if file is present
  let mentorImage = null;
  if (req.file) {
    try {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          require('streamifier').createReadStream(buffer).pipe(stream);
        });
      };
      const uploadResult = await streamUpload(req.file.buffer);
      mentorImage = uploadResult.secure_url;
    } catch (err) {
      return res.status(500).json({ message: 'Image upload failed', code: 500 });
    }
  } else {
    mentorImage = req.body.image === null ? "null" : req.body.image;
  }

  // Handle credentials upload if files are present
  let credentialsFolderUrl = null;
  let credentialsUrls = []; // Add this to store individual file URLs

  if (req.files && req.files.credentials && req.files.credentials.length > 0) {
    try {
      // Create a request object with the credential files AND headers
      const credsReq = { 
        ...req, 
        files: req.files.credentials,
        headers: req.headers // Forward the authorization header
      };
      
      // Create a response object that captures the data
      const credsRes = {
        data: null,
        status: function(code) { 
          return this; 
        },
        json: function(data) { 
          this.data = data; 
          return this; 
        }
      };
      
      // Upload the files and capture the response
      await uploadController.uploadMentorCredentials(credsReq, credsRes);
      
      // Extract URLs from the response
      if (credsRes.data) {
        credentialsFolderUrl = credsRes.data.folderUrl || credsRes.data.folderWebViewLink;
        
        // Store individual file URLs if available
        if (credsRes.data.files && Array.isArray(credsRes.data.files)) {
          credentialsUrls = credsRes.data.files.map(file => 
            file.webViewLink || file.webContentLink || file.url
          );
        }
      }
    } catch (err) {
      console.error('Error uploading mentor credentials:', err);
      return res.status(500).json({ message: 'Credentials upload failed', code: 500 });
    }
  }

  // Parse fields from req.body (FormData sends all as strings)
  const {
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
    sessionDur
  } = req.body;

  // Parse arrays if sent as JSON strings
  const parsedSubjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
  const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
  const parsedStyle = typeof style === 'string' ? JSON.parse(style) : style;

  const existingMentor = await Mentor.findOne({ id: decoded.id });
  if (existingMentor) {
    return res.status(400).json({ message: 'Mentor ID already exists', code: 400 });
  }
  if (!decoded.id || !decoded.username || !decoded.email || !age || !program || !yearLevel || !phoneNumber || !bio || !address || !modality || !parsedSubjects || !parsedAvailability || !parsedStyle || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }
  if (!modality.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400 });
  }
  if (!Array.isArray(parsedSubjects) || parsedSubjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedAvailability) || parsedAvailability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedStyle) || parsedStyle.length === 0) {
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
    subjects: parsedSubjects,
    availability: parsedAvailability,
    style: parsedStyle,
    sessionDur,
    image: mentorImage,
    credentials: credentialsUrls, // Add this line to set the required field
    credentialsFolderUrl: credentialsFolderUrl
  });

  await User.updateOne({ _id: decoded.id }, { role: 'mentor' });

  await mentor.save();
  return res.status(201).json(mentor);
};

exports.login = async (req, res) => {
  const { iniCred, password } = req.body;
  try {
    let query = [
      { username: iniCred },
      { email: iniCred }
    ];

    // If iniCred is 9 digits, add regex for email starting with those digits
    if (/^\d{9}$/.test(iniCred)) {
      query.push({ email: { $regex: `^${iniCred}` } });
    }

    const user = await User.findOne({ $or: query });

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
