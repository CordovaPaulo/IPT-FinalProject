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
        id: mentor._id,
      name: mentor.name,
      program: mentor.program,
      yearLevel: mentor.yearLevel,
      aveRating: mentor.aveRating,
      image: mentor.image,
      proficiency: mentor.proficiency,
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
    const { id } = req.params; // mentor ID
    const { date, time, location, subject } = req.body;
    
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!date || !time || !location || !subject) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }

    try {
        // Find mentor and learner
        const mentor = await Mentor.findById(id);
        const learner = await Learner.findOne({
            $or: [
                { _id: decoded.id },
                { userId: decoded.id }
            ]
        });

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found', code: 404 });
        }

        if (!learner) {
            return res.status(404).json({ message: 'Learner not found', code: 404 });
        }

        // Convert date string to Date object
        const scheduleDate = new Date(date);

        const mentorName = mentor.name;
        const learnerName = learner.name;

        // Create schedule with proper ObjectId references
        const schedule = new Schedule({
            learner: learner._id,
            mentor: mentor._id,
            learnerName: learnerName,
            mentorName: mentorName,
            date: scheduleDate,
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

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Retrieve all schedules for this learner
        const schedules = await Schedule.find({
            $or: [
                { learner: learner._id },
                { learner: learner.userId }
            ]
        });

        console.log('Found schedules:', schedules.length);

        // Split schedules and transform them
        const todaySchedule = [];
        const upcomingSchedule = [];
        const schedForReview = [];

        for (const schedule of schedules) {
            const schedDate = new Date(schedule.date);
            schedDate.setHours(0, 0, 0, 0);
            
            console.log('Processing schedule:', schedule._id);
            console.log('Mentor ID:', schedule.mentor);
            console.log('Learner ID:', schedule.learner);
            
            // Try different approaches to find mentor and learner
            let mentor = await Mentor.findById(schedule.mentor);
            if (!mentor) {
                mentor = await Mentor.findOne({ MentorId: schedule.mentor });
            }
            if (!mentor) {
                mentor = await Mentor.findOne({ _id: schedule.mentor });
            }
            
            let schedLearner = await Learner.findById(schedule.learner);
            if (!schedLearner) {
                schedLearner = await Learner.findOne({ userId: schedule.learner });
            }
            if (!schedLearner) {
                schedLearner = await Learner.findOne({ _id: schedule.learner });
            }
            
            console.log('Found mentor:', mentor?.name || 'Not found');
            console.log('Found learner:', schedLearner?.name || 'Not found');
            
            // Simplified response payload with only required information
            const transformedSchedule = {
                // Schedule information
                id: schedule._id,
                date: schedDate.toISOString().split('T')[0],
                time: schedule.time,
                location: schedule.location,
                subject: schedule.subject,
                
                // Mentor information (photo, name, program, year level)
                mentor: {
                    name: mentor?.name || 'Unknown Mentor',
                    program: mentor?.program || 'N/A',
                    yearLevel: mentor?.yearLevel || 'N/A',
                    image: mentor?.image || 'https://placehold.co/600x400'
                },
                
                // Learner information (name, program, year level)
                learner: {
                    name: schedLearner?.name || 'Unknown Learner',
                    program: schedLearner?.program || 'N/A',
                    yearLevel: schedLearner?.yearLevel || 'N/A'
                }
            };
            
            if (schedDate.getTime() === today.getTime()) {
                todaySchedule.push(transformedSchedule);
            } else if (schedDate > today) {
                upcomingSchedule.push(transformedSchedule);
            } else if (schedDate < today) {
                schedForReview.push(transformedSchedule);
            }
        }

        res.status(200).json({
            todaySchedule,
            upcomingSchedule,
            schedForReview
        });
    } catch (error) {
        console.error('Error in getSchedules:', error);
        res.status(500).json({ message: error.message, code: 500 });
    }
}

exports.getProfileInfo = async (req, res) => {
    const decoded = getValuesFromToken(req);
    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    try {
        const userData = await Learner.findOne({userId: decoded.id});

        if(!userData){
            res.status(404).json({ message: "User Account is none existent", code: 404})
        }

        res.status(200).json({userData})
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 })
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