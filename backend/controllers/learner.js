const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/feedback');
const { getValuesFromToken } = require('../service/jwt');

exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    if (mentors.length === 0) {
      return res.status(404).json({ message: 'No mentors found', code: 404 });
    }
    res.status(200).json(mentors.map(mentor => ({
      name: mentor.name,
      program: mentor.program,
      yearLevel: mentor.yearLevel,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.getMentorById = async (req, res) => {
  const { id } = req.params;
  try {
    const mentor = await Mentor.findOne({ _id: id });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found', code: 404 });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.setSchedule = async (req, res) => {
    const { id } = req.params;
    const { date, time, location, subject } = req.body;
    
    const decoded = getValuesFromToken(req);

    const mentorId = await Mentor.findById(id);

    if (!mentorId) {
      return res.status(404).json({ message: 'Mentor not found', code: 404 });
    }

    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if ( !decoded.id || !date || !time || !location || !subject) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }

    if (time < '08:00' || time > '20:00') {
        return res.status(400).json({ message: 'Time must be between 08:00 and 20:00', code: 400 });
    }

    if (date < new Date().toISOString().split('T')[0]) {
        return res.status(400).json({ message: 'Date must be in the future', code: 400 });
    }

    try {
        const schedule = new Schedule({
            learner: decoded.id,
            mentor: mentorId.MentorId,
            date,
            time,
            location,
            subject
        });
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 });
    }
}

exports.setFeedback = async (req, res) => {
    const { id } = req.params;
    const { rating, comments } = req.body;
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!rating || !comments) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }

    try {
        const feedback = new Feedback({
            learner: decoded.id,
            mentor: id,
            rating,
            comments
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 });
    } 
}

exports.getSchedules = async (req, res) => {
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }
    try {
        // Find learner by either _id or userId
        const learner = await Learner.findOne({
            $or: [
                { _id: decoded.id },
                { userId: decoded.id }
            ]
        });

        if (!learner) {
            return res.status(404).json({ message: 'Learner not found', code: 404 });
        }

        // Retrieve schedules using both possible references
        const schedules = await Schedule.find({
            $or: [
                { learner: learner._id },
                { learner: learner.userId }
            ]
        });

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 });
    }
}
// PATCH endpoints

exports.editProfile = async (req, res) => {
    const decoded = getValuesFromToken(req);
    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    // Fields allowed to update in Learner
    const learnerUpdates = {};
    const allowedLearnerFields = [
        'name', 'age', 'phoneNumber', 'bio', 'address', 'modality',
        'subjects', 'availability', 'style', 'sessionDur', 'image'
    ];
    allowedLearnerFields.forEach(field => {
        if (req.body[field] !== undefined) learnerUpdates[field] = req.body[field];
    });

    try {
        // Update Learner object
        const learner = await Learner.findOneAndUpdate(
            { $or: [{ _id: decoded.id }, { userId: decoded.id }] },
            { $set: learnerUpdates },
            { new: true }
        );
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found', code: 404 });
        }

        res.status(200).json({ learner});
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 });
    }
}