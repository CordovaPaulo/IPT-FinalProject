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
const mailingController = require('./mailing'); // add


exports.learnerSignup = async (req, res) => {
  const decoded = getValuesFromToken(req);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }

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

    if (user.role === 'mentor') {
      const mentor = await Mentor.findOne({ userId: user._id });
      if (mentor && mentor.accountStatus === 'pending') {
        return res.status(403).json({ message: 'Mentor account is still pending approval' });
      }
      if (mentor && mentor.accountStatus === 'rejected') {
        return res.status(403).json({ message: 'Mentor account has been rejected' });
      }
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'User account is suspended' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'User account is banned' });
    }

    const payload = { id: user._id, username: user.username, email: user.email, role: user.role, status: user.status };
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

// Helper: escape regex
function escRegex(s = '') { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Helper: first 9 digits from the local-part of email
function firstNineDigitsFromEmail(email = '') {
  const local = (email || '').split('@')[0] || '';
  const digits = local.replace(/\D/g, '');
  return digits.slice(0, 9);
}

exports.forgotPassword = async (req, res) => {
  try {
    const { pre_cred, id, name, email, role } = req.body || {};

    // Require at least the pre_cred; the rest are mandatory for verification
    if (!pre_cred) {
      return res.status(400).json({ message: 'pre_cred is required', code: 400 });
    }
    const missing = ['id', 'name', 'email', 'role'].filter((k) => !req.body?.[k]);
    if (missing.length) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}`, code: 400 });
    }

    // Find user by:
    // - username equals pre_cred
    // - OR email equals pre_cred
    // - OR email starts with the 9-digit id (or pre_cred if it is 9 digits)
    const nineFromPreCred = /^\d{9}$/.test(pre_cred) ? pre_cred : null;
    const orTerms = [
      { username: pre_cred },
      { email: pre_cred }
    ];

    // If pre_cred looks like 9 digits, match emails that start with those digits
    if (nineFromPreCred) {
      orTerms.push({ email: { $regex: `^${escRegex(nineFromPreCred)}`, $options: 'i' } });
    }

    // Also allow matching the provided id (if 9 digits) against email prefix
    if (/^\d{9}$/.test(id)) {
      orTerms.push({ email: { $regex: `^${escRegex(id)}`, $options: 'i' } });
    }

    const user = await User.findOne({ $or: orTerms });

    // Always respond generically on failure to avoid enumeration
    if (!user) {
      return res.status(400).json({ message: 'Verification failed', code: 400 });
    }

    // Validate role
    if ((role || '').toLowerCase() !== (user.role || '').toLowerCase()) {
      return res.status(400).json({ message: 'Verification failed', code: 400 });
    }

    // Validate email
    if ((email || '').toLowerCase().trim() !== (user.email || '').toLowerCase().trim()) {
      return res.status(400).json({ message: 'Verification failed', code: 400 });
    }

    // Validate id against first 9 digits in user.email
    const expectedId = firstNineDigitsFromEmail(user.email);
    if (!expectedId || id !== expectedId) {
      return res.status(400).json({ message: 'Verification failed', code: 400 });
    }

    // Validate name against username or profile name
    let profileName = null;
    if (user.role === 'learner') {
      const learner = await Learner.findOne({ userId: user._id });
      profileName = learner?.name || null;
    } else if (user.role === 'mentor') {
      const mentor = await Mentor.findOne({ userId: user._id });
      profileName = mentor?.name || null;
    }
    const normalized = (v) => (v || '').toString().trim().toLowerCase();
    const nameOk = normalized(name) === normalized(user.username) || (profileName && normalized(name) === normalized(profileName));
    if (!nameOk) {
      return res.status(400).json({ message: 'Verification failed', code: 400 });
    }

    // If all checks pass, issue reset token and email the link
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const appBase =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      'http://localhost:3000';

    const resetLink = `${appBase.replace(/\/+$/, '')}/auth/reset-password/${encodeURIComponent(resetToken)}`;

    // Brand palette aligned to frontend (indigo + clean light UI)
    const brand = {
      name: process.env.APP_NAME || 'MindMate',
      url: appBase.replace(/\/+$/, ''),
      primary: '#4F46E5',      // indigo-600
      primaryDark: '#4338CA',  // indigo-700
      bg: '#F8FAFC',           // slate-50
      cardBg: '#FFFFFF',
      text: '#0F172A',         // slate-900
      muted: '#475569',        // slate-600
      border: '#E2E8F0'        // slate-200
    };
    const logoUrl = `${brand.url}/logo.png`;

    const subject = `${brand.name} • Password Reset Request`;

    const text = `
Hi ${user.username},

We received a request to reset your password. Use the link below to set a new password. This link expires in 30 minutes.

${resetLink}

If you did not request this, you can ignore this email.

${brand.name} Team
`.trim();

    const html = `
<!doctype html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${brand.name} • Reset your password</title>
</head>
<body style="margin:0;padding:0;background:${brand.bg};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${brand.cardBg};border:1px solid ${brand.border};border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,.06);overflow:hidden;">
          <tr>
            <td style="height:6px;background:${brand.primary};"></td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 24px 0 24px;">
              <img src="${logoUrl}" width="64" height="64" alt="${brand.name} logo" style="display:block;margin:0 auto 8px;border-radius:12px;">
              <h1 style="margin:8px 0 0 0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:28px;color:${brand.text};font-weight:700;">Reset your password</h1>
              <p style="margin:6px 0 0 0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:${brand.muted};">
                We received a request to reset your ${brand.name} password.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 24px 4px 24px;">
              <a href="${resetLink}"
                 style="background:${brand.primary};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;display:inline-block;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:600;font-size:14px;">
                 Reset Password
              </a>
              <p style="margin:10px 0 0 0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${brand.muted};">
                This link expires in 30 minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 20px 24px;">
              <p style="margin:0 0 6px 0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${brand.muted};">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <a href="${resetLink}" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${brand.primaryDark};word-break:break-all;text-decoration:none;">
                ${resetLink}
              </a>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid ${brand.border};padding:16px 24px 20px 24px;">
              <p style="margin:0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${brand.muted};">
                Didn’t request this? You can safely ignore this email.
              </p>
              <p style="margin:8px 0 0 0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${brand.muted};">
                © ${new Date().getFullYear()} ${brand.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    await mailingController.sendEmailNotification(user.email, subject, text, html);

    return res.status(200).json({ message: 'Password reset link sent if verification succeeded.', code: 200 });
  } catch (err) {
    console.error('[FORGOT PASSWORD VERIFY]', err);
    return res.status(500).json({ message: 'Internal server error', code: 500 });
  }
};

// Verify a reset token (optional helper for frontend)
exports.verifyResetToken = async (req, res) => {
  try {
    const token = req.query?.token || req.body?.token;
    if (!token) return res.status(400).json({ message: 'token is required', code: 400 });

    const payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET);
    if (payload?.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token type', code: 400 });
    }
    return res.status(200).json({ valid: true, userId: payload.id, code: 200 });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token', code: 400 });
  }
};

// Reset password using a valid token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'token, newPassword and confirmPassword are required', code: 400 });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match', code: 400 });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters', code: 400 });
    }

    const payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET);
    if (payload?.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token type', code: 400 });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found', code: 404 });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully', code: 200 });
  } catch (err) {
    console.error('[RESET PASSWORD]', err);
    return res.status(400).json({ message: 'Invalid or expired token', code: 400 });
  }
};
