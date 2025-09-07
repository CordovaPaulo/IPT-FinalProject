var express = require('express');   
var router = express.Router();
const mentorController = require('../controllers/mentor');
const jwtService = require('../service/jwt');


//POST routes

//GET routes

//PATCH routes
router.get('/mentor/learners', jwtService.authenticateToken('mentor'), mentorController.getAllLearners);
router.get('/mentor/learners/:id', jwtService.authenticateToken('mentor'), mentorController.getLearnerById);
router.post('/mentor/schedule/:id', jwtService.authenticateToken('mentor'), mentorController.setSchedule);

module.exports = router;
