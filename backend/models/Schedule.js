const mongoose = require('mongoose');
const Mentor = require('./Mentor');

const scheduleSchema = new mongoose.Schema({
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    mentorName: { type: String, required: true },
    learnerName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    subject: { type: String, required: true }
}, { collections: 'schedules' });

module.exports = mongoose.model('Schedule', scheduleSchema);
