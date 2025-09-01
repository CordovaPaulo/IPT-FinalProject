const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/User');

async function signup(username, email, password, confirmPassword) {
	const existingUser = await User.findOne({ username });
	if (existingUser) {
		throw new Error('Username already exists');
	}
	if (password !== confirmPassword) {
		throw new Error('Passwords do not match');
	}
	const hashedPassword = await bcrypt.hash(password, 15);
	const user = new User({ username, email, password: hashedPassword });
	await user.save();
	return user;
}

async function login(username, password) {
	const user = await User.findOne({ username });
	if (!user) {
		throw new Error('User not found');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Invalid password');
	}

	const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

	return { user, token };
}

module.exports = { signup, login };
