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
    const { schedule, rating, comments } = req.body;
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!rating || !comments || !schedule) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }

    const learnerId = await Learner.findOne({
        $or: [
            { _id: decoded.id },
            { userId: decoded.id }
        ]
    });

    try {
        const feedback = new Feedback({
            learner: learnerId._id,
            mentor: id,
            schedule,
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
                mentor = await Mentor.findOne({ userId: schedule.mentor });
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
                
                // Mentor information (include id)
                mentor: {
                    id: mentor?._id || schedule.mentor, // <- added id
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

exports.cancelSched = async (req, res) => {
    const { id } = req.params;
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!id) {
        return res.status(400).json({ message: 'Schedule id is required', code: 400 });
    }

    try {
        const schedule = await Schedule.findById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found', code: 404 });
        }

        // const requesterId = String(decoded.id);
        // const schedLearnerId = String(schedule.learner);
        // const schedMentorId = String(schedule.mentor);

        // // only the learner or the mentor involved can cancel
        // if (requesterId !== schedLearnerId && requesterId !== schedMentorId) {
        //     return res.status(403).json({ message: 'Not authorized to cancel this schedule', code: 403 });
        // }

        await Schedule.findByIdAndDelete(id);

        // notify the other party if socket.io is available (optional)
        try {
            const io = req.app && req.app.get('io');
            if (io) {
                const otherId = requesterId === schedLearnerId ? schedMentorId : schedLearnerId;
                io.to(String(otherId)).emit('scheduleCanceled', {
                    scheduleId: id,
                    canceledBy: requesterId,
                    date: schedule.date,
                    time: schedule.time,
                    subject: schedule.subject,
                });
            }
        } catch (emitErr) {
            // do not fail the request if emit fails
            console.error('Socket emit error (cancelSched):', emitErr);
        }

        res.status(200).json({ message: 'Schedule canceled', code: 200 });
    } catch (error) {
        res.status(500).json({ message: error.message, code: 500 });
    }
}

exports.reschedSched = async (req, res) => {
    const { id } = req.params;
    const { date, time, location, subject } = req.body;
    const decoded = getValuesFromToken(req);

    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }

    if (!id) {
        return res.status(400).json({ message: 'Schedule id is required', code: 400 });
    }

    if (!date && !time && !location && !subject) {
        return res.status(400).json({ message: 'At least one field (date, time, location, subject) is required to reschedule', code: 400 });
    }

    try {
        const schedule = await Schedule.findById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found', code: 404 });
        }

        // const requesterId = String(decoded.id);
        // const schedLearnerId = String(schedule.learner);
        // const schedMentorId = String(schedule.mentor);

        // // only the learner or the mentor involved can reschedule
        // if (requesterId !== schedLearnerId && requesterId !== schedMentorId) {
        //     return res.status(403).json({ message: 'Not authorized to reschedule this schedule', code: 403 });
        // }

        // keep old values for notification
        const oldValues = {
            date: schedule.date,
            time: schedule.time,
            location: schedule.location,
            subject: schedule.subject
        };

        // apply updates
        if (date) schedule.date = new Date(date);
        if (time) schedule.time = time;
        if (location) schedule.location = location;
        if (subject) schedule.subject = subject;

        await schedule.save();

        // notify the other party if socket.io is available (optional)
        try {
            const io = req.app && req.app.get('io');
            if (io) {
                const otherId = requesterId === schedLearnerId ? schedMentorId : schedLearnerId;
                io.to(String(otherId)).emit('scheduleRescheduled', {
                    scheduleId: id,
                    rescheduledBy: requesterId,
                    old: {
                        date: oldValues.date,
                        time: oldValues.time,
                        location: oldValues.location,
                        subject: oldValues.subject
                    },
                    updated: {
                        date: schedule.date,
                        time: schedule.time,
                        location: schedule.location,
                        subject: schedule.subject
                    }
                });
            }
        } catch (emitErr) {
            console.error('Socket emit error (reschedSched):', emitErr);
        }

        res.status(200).json({ message: 'Schedule rescheduled', schedule, code: 200 });
    } catch (error) {
        console.error('reschedSched error:', error);
        res.status(500).json({ message: error.message, code: 500 });
    }
}

exports.getFeedbacks = async (req, res) => {
    const decoded = getValuesFromToken(req);
    if (!decoded || !decoded.id) {
        return res.status(403).json({ message: 'Invalid token', code: 403 });
    }
    try {
        const learner = await Learner.findOne({
            $or: [
                { _id: decoded.id },
                { userId: decoded.id }
            ]
        });
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found', code: 404 });
        }

        const feedbacks = await Feedback.find({ learner: learner._id });

        if (feedbacks.length === 0) {
            return res.status(404).json({ message: 'No feedbacks found', code: 404 });
        }
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Internal server error', code: 500 });
    }
}