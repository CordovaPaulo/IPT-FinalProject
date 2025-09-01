const { token } = require('morgan');
const { signup, login } = require('../service/auth');

exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    const user = await signup(username, email, password, confirmPassword);
    res.status(201).json({ message: 'User registered successfully', user: { username: user.user.username } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await login(username, password);
    res.status(200).json({ message: 'Login successful', user: { username: user.user.username, token: user.token } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
