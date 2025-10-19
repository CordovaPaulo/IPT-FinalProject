const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/feedback');
const { authenticateToken, getValuesFromToken } = require('../service/jwt');
const mailingController = require('./mailing');


exports.getStats = async (req, res) => {
    try {
        const learnerCount = await Learner.countDocuments();
        const mentorCount = await Mentor.countDocuments();
        const scheduleCount = await Schedule.countDocuments();
        const feedbackCount = await Feedback.countDocuments();

        return res.status(200).json({
            learnerCount,
            mentorCount,
            scheduleCount,
            feedbackCount
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ message: 'Server error fetching stats', error });
    }
};

exports.getAllLearners = async (req, res) => {
    try {
        // get learners without populate
        const learners = await Learner.find().lean();

        if (!learners || learners.length === 0) {
            return res.status(404).json({ message: 'No learners found', code: 404 });
        }

        // collect unique userIds referenced by learners
        const userIds = Array.from(new Set(
            learners
                .map(m => m.userId)
                .filter(Boolean)
                .map(id => String(id))
        ));

        // batch load users referenced by learners
        let users = [];
        if (userIds.length) {
            users = await User.find({ _id: { $in: userIds } })
                .select('name email')
                .lean();
        }

        const userMap = new Map(users.map(u => [String(u._id), u]));

        const result = learners.map((ln) => {
            const userRecord = ln.userId ? userMap.get(String(ln.userId)) : null;

            // prefer user record when available, otherwise fall back to learner fields
            const email = (userRecord && userRecord.email) || ln.email || '';
            const name = (userRecord && userRecord.name) || ln.name || '';
            const userId = (userRecord && userRecord._id) || ln.userId || null;
            const status = ln.status || 'pending';

            // extract leading digits before '@' as studentId, if present
            const match = String(email).match(/^(\d+)(?=@)/);
            const studentId = match ? match[1] : null;

            return {
                learnerId: ln._id,
                userId,
                name,
                email,
                studentId,
                status,
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching learners:', error);
        return res.status(500).json({ message: 'Server error fetching learners', error });
    }
}

exports.getAllMentors = async (req, res) => {
    try {
        // get mentors without populate
        const mentors = await Mentor.find().lean();

        if (!mentors || mentors.length === 0) {
            return res.status(404).json({ message: 'No mentors found', code: 404 });
        }

        // collect unique userIds referenced by mentors
        const userIds = Array.from(new Set(
            mentors
                .map(m => m.userId)
                .filter(Boolean)
                .map(id => String(id))
        ));

        // batch load users referenced by mentors   
        let users = [];
        if (userIds.length) {
            users = await User.find({ _id: { $in: userIds } })
                .select('name email')
                .lean();
        }

        const userMap = new Map(users.map(u => [String(u._id), u]));

        const result = mentors.map((mn) => {
            const userRecord = mn.userId ? userMap.get(String(mn.userId)) : null;

            // prefer user record when available, otherwise fall back to mentor fields
            const email = (userRecord && userRecord.email) || mn.email || '';
            const name = (userRecord && userRecord.name) || mn.name || '';
            const userId = (userRecord && userRecord._id) || mn.userId || null;
            const status = mn.status || 'pending';

            // extract leading digits before '@' as studentId, if present
            const match = String(email).match(/^(\d+)(?=@)/);
            const studentId = match ? match[1] : null;

            return {
                mentorId: mn._id,
                userId,
                name,
                email,
                studentId,
                status,
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        return res.status(500).json({ message: 'Server error fetching mentors', error });
    }
}

exports.getOneLearner = async (req, res) => {
    const learnerId = req.params.learnerId;
    try {
        const learner = await Learner.findById(learnerId).lean();
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found', code: 404 });
        }
        return res.status(200).json(learner);
    } catch (error) {
        console.error('Error fetching learner:', error);
        return res.status(500).json({ message: 'Server error fetching learner', error });
    }
}


exports.getOneMentor = async (req, res) => {
    const mentorId = req.params.mentorId;
    try {
        const mentor = await Mentor.findById(mentorId).lean();
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found', code: 404 });
        }
        return res.status(200).json(mentor);
    } catch (error) {
        console.error('Error fetching mentor:', error);
        return res.status(500).json({ message: 'Server error fetching mentor', error });
    }
}

exports.approveMentor = async (req, res) => {
    const mentorId = req.params.mentorId;
    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found', code: 404 });
        }
        mentor.accountStatus = 'accepted';
        await mentor.save();
        return res.status(200).json({ message: 'Mentor approved successfully', mentor });
    } catch (error) {
        console.error('Error approving mentor:', error);
        return res.status(500).json({ message: 'Server error approving mentor', error });
    }
}

exports.rejectMentor = async (req, res) => {
    const mentorId = req.params.mentorId;
    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found', code: 404 });
        }
        mentor.accountStatus = 'rejected';
        await mentor.save();
        return res.status(200).json({ message: 'Mentor rejected successfully', mentor });
    } catch (error) {
        console.error('Error rejecting mentor:', error);
        return res.status(500).json({ message: 'Server error rejecting mentor', error });
    }
}

exports.activateAccount = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404 });
        }
        user.status = 'active';
        await user.save();
        return res.status(200).json({ message: 'User account activated successfully', user });
    } catch (error) {
        console.error('Error activating user account:', error);
        return res.status(500).json({ message: 'Server error activating user account', error });
    }
}

exports.suspendAccount = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404 });
        }
        user.status = 'suspended';
        await user.save();
        return res.status(200).json({ message: 'User account suspended successfully', user });
    } catch (error) {
        console.error('Error suspending user account:', error);
        return res.status(500).json({ message: 'Server error suspending user account', error });
    }
}

exports.banAccount = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404 });
        }
        user.status = 'banned';
        await user.save();
        return res.status(200).json({ message: 'User account banned successfully', user });
    } catch (error) {
        console.error('Error banning user account:', error);
        return res.status(500).json({ message: 'Server error banning user account', error });
    }
}