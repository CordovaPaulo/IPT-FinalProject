const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/feedback');
const { getValuesFromToken } = require('../service/jwt');

exports.getAllLearners = async (req, res) => {
  try {
    const learners = await Learner.find();
    if (learners.length === 0) {
      return res.status(404).json({ message: 'No learners found', code: 404 });
    }
    res.status(200).json(learners.map(learner => ({
      name: learner.name,
      program: learner.program,
      yearLevel: learner.yearLevel,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.getLearnerById = async (req, res) => {
  const { id } = req.params;
  try {
    const learner = await Learner.findOne({ _id: id });
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found', code: 404 });
    }
    res.status(200).json(learner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', code: 500 });
  }
};

exports.setSchedule = async (req, res) => {
    const { id } = req.params;
    const { date, time, location, subject } = req.body;

    const decoded = getValuesFromToken(req);

    const learner = await Learner.findById(id);

    if(!learner){
      return res.status(404).json({message: 'Learner not found', code: 404})
    }
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!decoded.id || !date || !time || !location || !subject) {
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
            learner: learner.userId,
            mentor: decoded.id,
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
};

exports.getFeetbacks = async (req, res) => {
    const decoded = getValuesFromToken(req);

    
}