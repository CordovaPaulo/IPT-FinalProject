const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const { getValuesFromToken } = require('../service/jwt');

exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    if (mentors.length === 0) {
      return res.status(404).json({ message: 'No mentors found', code: 404 });
    }
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.getMentorById = async (req, res) => {
  const { id } = req.params;
  try {
    const mentor = await Mentor.findOne({ MentorId: id });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found', code: 404 });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.setSchedule = async (req, res) => {
    const { mentorId } = req.params;
    const { date, time, location, subject } = req.body;
    
    const decoded = getValuesFromToken(req);
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
            mentor: mentorId,
            date,
            time,
            location,
            subject
        });
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', code: 500 });
    }
}