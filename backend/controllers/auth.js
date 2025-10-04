const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const { getValuesFromToken } = require('../service/jwt');
const uploadController = require('./upload');
const cloudinary = require('../service/cloudinary');
const streamifier = require('streamifier');
const { setCookie } = require('./cookie');


exports.learnerSignup = async (req, res) => {
  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  // Handle profile picture upload if file is present
  let learnerImage = null;
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
          streamifier.createReadStream(buffer).pipe(stream);
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
    program,
    yearLevel,
    phoneNumber,
    bio,
    sex,
    goals,
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

  // Check if learner already exists
  const existingLearner = await Learner.findOne({ userId: decoded.id });
  if (existingLearner) {
    return res.status(400).json({ message: 'Learner already exists', code: 400 });
  }

  // Validate required fields
  if (!decoded.id || !decoded.username || !decoded.email || !program || !yearLevel || !phoneNumber || !bio || !sex || !goals || !address || !modality || !parsedSubjects || !parsedAvailability || !parsedStyle || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }

  // Validate field formats
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }

  // Define valid enum values (from your Learner model)
  const validPrograms = ['BSIT', 'BSCS', 'BSEMC'];
  const validYearLevels = ['1st year', '2nd year', '3rd year', '4th year', 'graduate'];
  const validModalities = ['online', 'in-person', 'hybrid'];
  const validSessionDurations = ['1hr', '2hrs', '3hrs'];
  const validSexValues = ['male', 'female'];
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const validStyles = ['lecture-based', 'interactive-discussion', 'q-and-a-discussion', 'demonstrations', 'project-based', 'step-by-step-discussion'];

  // Validate enum values
  if (!validPrograms.includes(program)) {
    return res.status(400).json({ message: 'Invalid program', code: 400, validOptions: validPrograms });
  }
  if (!validYearLevels.includes(yearLevel)) {
    return res.status(400).json({ message: 'Invalid year level', code: 400, validOptions: validYearLevels });
  }
  if (!validModalities.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400, validOptions: validModalities });
  }
  if (!validSessionDurations.includes(sessionDur)) {
    return res.status(400).json({ message: 'Invalid session duration', code: 400, validOptions: validSessionDurations });
  }
  if (!validSexValues.includes(sex)) {
    return res.status(400).json({ message: 'Invalid sex value', code: 400, validOptions: validSexValues });
  }

  // Validate arrays
  if (!Array.isArray(parsedSubjects) || parsedSubjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedAvailability) || parsedAvailability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedStyle) || parsedStyle.length === 0) {
    return res.status(400).json({ message: 'Style must be a non-empty array', code: 400 });
  }

  // Validate availability days
  for (const day of parsedAvailability) {
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: `Invalid availability day: ${day}`, code: 400, validOptions: validDays });
    }
  }

  // Validate learning styles
  for (const style of parsedStyle) {
    if (!validStyles.includes(style)) {
      return res.status(400).json({ message: `Invalid learning style: ${style}`, code: 400, validOptions: validStyles });
    }
  }

  try {
    // Create learner document
    const learner = new Learner({
      userId: decoded.id,
      name: decoded.username,
      email: decoded.email,
      sex,
      program,
      yearLevel,
      phoneNumber,
      bio,
      goals,
      address,
      modality,
      subjects: parsedSubjects,
      availability: parsedAvailability,
      style: parsedStyle,
      sessionDur,
      image: learnerImage
    });

    // Update user role
    await User.updateOne({ _id: decoded.id }, { role: 'learner' });
    
    // Save learner
    await learner.save();
    
    return res.status(201).json({
      message: 'Learner created successfully',
      learner: {
        id: learner._id,
        name: learner.name,
        email: learner.email,
        role: 'learner'
      }
    });
  } catch (error) {
    console.error('Error saving learner:', error);
    return res.status(500).json({ message: 'Error creating learner', code: 500, error: error.message });
  }
};

exports.mentorSignup = async (req, res) => {
  // Try to get token from Authorization header first, fallback to cookie
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.MindMateToken) {
    token = req.cookies.MindMateToken;
  }
  const decoded = token ? require('jsonwebtoken').verify(token, process.env.JWT_SECRET) : null;
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

  // Handle profile picture upload
  let mentorImage = null;
  const imageFile =
    req.file // in case a different middleware calls .single('image')
    || (req.files && Array.isArray(req.files.image) && req.files.image[0]);
  if (imageFile) {
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
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
      const uploadResult = await streamUpload(imageFile.buffer);
      mentorImage = uploadResult.secure_url;
    } catch (err) {
      return res.status(500).json({ message: 'Image upload failed', code: 500 });
    }
  } else {
    mentorImage = req.body.image === null ? "null" : req.body.image;
  }

  // Handle credentials upload if files are present
  let credentialsFolderUrl = null;
  let credentialsUrls = [];
  if (req.files && Array.isArray(req.files.credentials) && req.files.credentials.length > 0) {
    try {
      const credsReq = {
        ...req,
        files: req.files.credentials,
        headers: req.headers
      };
      const credsRes = {
        data: null,
        status: function () { return this; },
        json: function (data) { this.data = data; return this; }
      };
      await uploadController.uploadMentorCredentials(credsReq, credsRes);

      if (credsRes.data) {
        credentialsFolderUrl = credsRes.data.folderUrl || credsRes.data.folderWebViewLink || null;
        if (credsRes.data.files && Array.isArray(credsRes.data.files)) {
          credentialsUrls = credsRes.data.files.map(f => f.webViewLink || f.webContentLink || f.url).filter(Boolean);
        }
      }
    } catch (err) {
      console.error('Error uploading mentor credentials:', err);
      return res.status(500).json({ message: 'Credentials upload failed', code: 500 });
    }
  }

  // Parse fields from req.body (FormData sends all as strings)
  const {
    sex, program, yearLevel, phoneNumber, bio, exp, address, modality,
    proficiency, subjects, availability, style, sessionDur
  } = req.body;

  // Parse arrays if sent as JSON strings
  const parsedSubjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
  const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
  const parsedStyle = typeof style === 'string' ? JSON.parse(style) : style;

  // Validate required fields (add more as needed)
  if (!decoded.id || !decoded.username || !decoded.email || !sex || !program || !yearLevel || !phoneNumber || !bio || !exp || !address || !modality || !proficiency || !parsedSubjects || !parsedAvailability || !parsedStyle || !sessionDur) {
    return res.status(400).json({ message: 'All fields are required', code: 400 });
  }

  // Validate field formats
  if (phoneNumber.length !== 11) {
    return res.status(400).json({ message: 'Phone number must be 11 digits', code: 400 });
  }
  if (bio.length < 10 || bio.length > 550) {
    return res.status(400).json({ message: 'Bio must be between 10 and 550 characters', code: 400 });
  }

  // Define valid enum values (from your Mentor model)
  const validPrograms = ['BSIT', 'BSCS', 'BSEMC'];
  const validYearLevels = ['1st year', '2nd year', '3rd year', '4th year', 'graduate'];
  const validModalities = ['online', 'in-person', 'hybrid'];
  const validSessionDurations = ['1hr', '2hrs', '3hrs'];
  const validSexValues = ['male', 'female'];
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const validStyles = ['lecture-based', 'interactive-discussion', 'q-and-a-discussion', 'demonstrations', 'project-based', 'step-by-step-discussion'];

  // Validate enum values
  if (!validPrograms.includes(program)) {
    return res.status(400).json({ message: 'Invalid program', code: 400, validOptions: validPrograms });
  }
  if (!validYearLevels.includes(yearLevel)) {
    return res.status(400).json({ message: 'Invalid year level', code: 400, validOptions: validYearLevels });
  }
  if (!validModalities.includes(modality)) {
    return res.status(400).json({ message: 'Invalid modality', code: 400, validOptions: validModalities });
  }
  if (!validSessionDurations.includes(sessionDur)) {
    return res.status(400).json({ message: 'Invalid session duration', code: 400, validOptions: validSessionDurations });
  }
  if (!validSexValues.includes(sex)) {
    return res.status(400).json({ message: 'Invalid sex value', code: 400, validOptions: validSexValues });
  }

  // Validate arrays
  if (!Array.isArray(parsedSubjects) || parsedSubjects.length === 0) {
    return res.status(400).json({ message: 'Subjects must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedAvailability) || parsedAvailability.length === 0) {
    return res.status(400).json({ message: 'Availability must be a non-empty array', code: 400 });
  }
  if (!Array.isArray(parsedStyle) || parsedStyle.length === 0) {
    return res.status(400).json({ message: 'Style must be a non-empty array', code: 400 });
  }

  // Validate availability days
  for (const day of parsedAvailability) {
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: `Invalid availability day: ${day}`, code: 400, validOptions: validDays });
    }
  }

  // Validate learning styles
  for (const style of parsedStyle) {
    if (!validStyles.includes(style)) {
      return res.status(400).json({ message: `Invalid learning style: ${style}`, code: 400, validOptions: validStyles });
    }
  }

  try {
    // Create mentor document
    const mentor = new Mentor({
      userId: decoded.id,
      name: decoded.username,
      email: decoded.email,
      sex,
      program,
      yearLevel,
      phoneNumber,
      bio,
      exp,
      address,
      modality,
      proficiency,
      subjects: parsedSubjects,
      availability: parsedAvailability,
      style: parsedStyle,
      sessionDur,
      image: mentorImage,
      credentials: credentialsUrls,
      credentialsFolderUrl: credentialsFolderUrl
    });

    // Update user role
    await User.updateOne({ _id: decoded.id }, { role: 'mentor' });
    
    // Save mentor
    await mentor.save();
    
    return res.status(201).json(mentor);
  } catch (error) {
    console.error('Error saving mentor:', error);
    return res.status(500).json({ message: 'Error creating mentor', code: 500, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('[LOGIN] body:', req.body);
    const { iniCred, password } = req.body;
    if (!iniCred || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const query = [
      { username: iniCred },
      { email: iniCred }
    ];
    if (/^\d{9}$/.test(iniCred)) {
      query.push({ email: { $regex: `^${iniCred}` } });
    }
    const user = await User.findOne({ $or: query });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('MindMateToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || `${7 * 24 * 60 * 60 * 1000}`, 10)
    });

    // Return token and role so the frontend can store the token and redirect by role
    return res.json({
      token,
      userRole: payload.role,
      user: payload
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ message: 'Internal server error', detail: err.message });
  }
};
