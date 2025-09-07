const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    role: { type: String, default: null, enum: ['learner', 'mentor', 'admin'] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
}, { collection: 'users' });

const User = mongoose.model('users', userSchema);

module.exports = User;
