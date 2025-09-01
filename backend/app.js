const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser()); 

// API Routes
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

// 404 handler
app.use((req, res, next) => {
	res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		error: err.message || 'Internal Server Error',
	});
});

module.exports = app;
