const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/feedback');
const { getValuesFromToken } = require('../service/jwt');
const mailingController = require('./mailing');

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
        // optionally notify mentor about new booking by learner (email)
        try {
          await mailingController.sendRescheduleByLearner( // reuse reschedule-by-learner to notify mentor of a new booking might be odd
            schedule._id,
            learner._id,
            schedule.date,
            schedule.time,
            schedule.location
          );
        } catch (mailErr) {
          console.error('Error sending booking notification email (learner->mentor):', mailErr);
        }
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

    if (!rating || !comments ) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }

    const learnerId = await Learner.findOne({
        $or: [
            { _id: decoded.id },
            { userId: decoded.id }
        ]
    });

    const sched = await Schedule.findOne({ _id: id });

    try {
        const feedback = new Feedback({
            learner: learnerId._id,
            mentor: sched.mentor,
            schedule: sched._id,
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
  const { reason = '' } = req.body;

  if (!decoded?.id) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }
  if (!id) {
    return res.status(400).json({ message: 'Schedule id is required', code: 400 });
  }

  try {
    // find learner from token
    const learner = await Learner.findOne({
      $or: [{ _id: decoded.id }, { userId: decoded.id }]
    });
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found', code: 404 });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found', code: 404 });
    }

    // authorize: schedule must belong to this learner
    const ownsSchedule =
      String(schedule.learner) === String(learner._id) ||
      String(schedule.learner) === String(learner.userId);

    if (!ownsSchedule) {
      return res.status(403).json({ message: 'Not authorized to cancel this schedule', code: 403 });
    }

    // delete (or update status if you prefer soft delete)
    await Schedule.findByIdAndDelete(id);

    // optional socket emit
    try {
      const io = req.app?.get && req.app.get('io');
      if (io) {
        io.to(String(schedule.mentor)).emit('scheduleCanceled', {
          scheduleId: id,
          canceledBy: String(learner._id),
          date: schedule.date,
          time: schedule.time,
          subject: schedule.subject
        });
      }
    } catch (emitErr) {
      console.error('Socket emit error (learner.cancelSched):', emitErr);
    }

    // send email to mentor
    try {
      await mailingController.sendCancellationByLearner(id, String(learner._id), reason);
    } catch (mailErr) {
      console.error('Error sending cancellation email (learner):', mailErr);
    }

    return res.status(200).json({ message: 'Schedule canceled', code: 200 });
  } catch (error) {
    console.error('cancelSched error:', error);
    return res.status(500).json({ message: error.message, code: 500 });
  }
};

exports.reschedSched = async (req, res) => {
  const { id } = req.params;
  const { date, time, location, subject } = req.body;
  const decoded = getValuesFromToken(req);

  if (!decoded?.id) {
    return res.status(403).json({ message: 'Invalid token', code: 403 });
  }
  if (!id) {
    return res.status(400).json({ message: 'Schedule id is required', code: 400 });
  }
  if (!date && !time && !location && !subject) {
    return res.status(400).json({ message: 'Provide at least one of date, time, location, subject', code: 400 });
  }

  try {
    // find learner from token
    const learner = await Learner.findOne({
      $or: [{ _id: decoded.id }, { userId: decoded.id }]
    });
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found', code: 404 });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found', code: 404 });
    }

    // authorize
    const ownsSchedule =
      String(schedule.learner) === String(learner._id) ||
      String(schedule.learner) === String(learner.userId);

    if (!ownsSchedule) {
      return res.status(403).json({ message: 'Not authorized to reschedule this schedule', code: 403 });
    }

    // validations (simple examples)
    if (time && (time < '06:00' || time > '22:00')) {
      return res.status(400).json({ message: 'Time must be between 06:00 and 22:00', code: 400 });
    }
    if (date) {
      const today = new Date(); today.setHours(0,0,0,0);
      const newDate = new Date(date); newDate.setHours(0,0,0,0);
      if (newDate < today) {
        return res.status(400).json({ message: 'Date must be today or later', code: 400 });
      }
    }

    const oldValues = {
      date: schedule.date,
      time: schedule.time,
      location: schedule.location,
      subject: schedule.subject
    };

    if (date) schedule.date = new Date(date);
    if (time) schedule.time = time;
    if (location) schedule.location = location;
    if (subject) schedule.subject = subject;

    await schedule.save();

    // optional socket emit
    try {
      const io = req.app?.get && req.app.get('io');
      if (io) {
        io.to(String(schedule.mentor)).emit('scheduleRescheduled', {
          scheduleId: id,
          rescheduledBy: String(learner._id),
          old: oldValues,
          updated: {
            date: schedule.date,
            time: schedule.time,
            location: schedule.location,
            subject: schedule.subject
          }
        });
      }
    } catch (emitErr) {
      console.error('Socket emit error (learner.reschedSched):', emitErr);
    }

    // email mentor
    try {
      await mailingController.sendRescheduleByLearner(
        id,
        String(learner._id),
        schedule.date,
        schedule.time,
        schedule.location
      );
    } catch (mailErr) {
      console.error('Error sending reschedule email (learner):', mailErr);
    }

    return res.status(200).json({ message: 'Schedule rescheduled', schedule, code: 200 });
  } catch (error) {
    console.error('reschedSched error:', error);
    return res.status(500).json({ message: error.message, code: 500 });
  }
};

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

exports.acceptOffer = async (req, res) => {
  try {
    // 1) Read offer token from query or body (sendOffer builds base64url JSON token)
    const token = req.query?.token || req.body?.token;
    if (!token) {
      return res.status(400).json({ message: 'token is required', code: 400 });
    }

    // 2) Decode token (base64url -> JSON)
    let payload;
    try {
      const json = Buffer.from(token, 'base64url').toString('utf8');
      payload = JSON.parse(json);
    } catch {
      return res.status(400).json({ message: 'Invalid offer token', code: 400 });
    }

    const required = ['mentorId', 'learnerId', 'date', 'time', 'location', 'subject'];
    const missing = required.filter(k => !payload[k]);
    if (missing.length) {
      return res.status(400).json({ message: `Missing fields in token: ${missing.join(', ')}`, code: 400 });
    }

    // 3) If Authorization header is present, ensure it matches the token's learnerId. If not present, continue.
    const maybeDecoded = (() => {
      try { return getValuesFromToken(req); } catch { return null; }
    })();
    if (maybeDecoded?.id) {
      // Resolve the authenticated learner and compare
      const authLearner = await Learner.findOne({ $or: [{ _id: maybeDecoded.id }, { userId: maybeDecoded.id }] });
      if (authLearner && String(authLearner._id) !== String(payload.learnerId)) {
        return res.status(403).json({ message: 'Offer not intended for this learner', code: 403 });
      }
    }

    // 4) Load entities referenced by the token
    let learner = await Learner.findById(payload.learnerId);
    if (!learner) learner = await Learner.findOne({ userId: payload.learnerId });
    if (!learner) return res.status(404).json({ message: 'Learner not found', code: 404 });

    let mentor = await Mentor.findById(payload.mentorId);
    if (!mentor) mentor = await Mentor.findOne({ userId: payload.mentorId });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found', code: 404 });

    // 5) Basic validations matching your other endpoints
    const scheduleDate = new Date(payload.date);
    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date', code: 400 });
    }
    if (payload.time < '06:00' || payload.time > '22:00') {
      return res.status(400).json({ message: 'Time must be between 06:00 and 22:00', code: 400 });
    }

    // Prevent duplicates (same mentor/learner/date/time)
    const existing = await Schedule.findOne({
      learner: learner._id,
      mentor: mentor._id,
      date: scheduleDate,
      time: payload.time
    });
    if (existing) {
      return res.status(409).json({ message: 'Schedule already exists for this slot', schedule: existing, code: 409 });
    }

    // 6) Create the schedule
    const schedule = new Schedule({
      learner: learner._id,
      mentor: mentor._id,
      learnerName: learner.name,
      mentorName: mentor.name,
      date: scheduleDate,
      time: payload.time,
      location: payload.location,
      subject: payload.subject
    });
    await schedule.save();

    // 7) Notify mentor (best-effort)
    try {
      const mentorUser = mentor.userId ? await User.findById(mentor.userId) : null;
      const mentorEmail = mentorUser?.email || mentor.email;
      if (mentorEmail) {
        await mailingController.sendEmailNotification(
          mentorEmail,
          `Offer accepted: ${payload.subject}`,
          `Hello ${mentor.name},

${learner.name} accepted your offer.

Details:
- Subject: ${payload.subject}
- Date: ${scheduleDate.toLocaleDateString()}
- Time: ${payload.time}
- Location: ${payload.location}

Best regards,
MindMate Team`
        );
      }
    } catch (mailErr) {
      console.error('acceptOffer notify mentor error:', mailErr);
    }

    return res.status(201).json({ message: 'Offer accepted. Schedule created.', schedule, code: 201 });
  } catch (error) {
    console.error('acceptOffer error:', error);
    return res.status(500).json({ message: error.message, code: 500 });
  }
};