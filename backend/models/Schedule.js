const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    subject: { type: String, required: true }
}, { collections: 'schedules' });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
