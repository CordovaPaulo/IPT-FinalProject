const mongoose = require('mongoose');
const { generateAIResponse } = require('../service/ai');
const Schedule = require('../models/Schedule');
const { getValuesFromToken } = require('../service/jwt'); 
const Learner = require('../models/Learner');
const Mentor = require('../models/Mentor');

module.exports.fetchLearnerDashboard = async (req, res) => {
    try {
        const decoded = getValuesFromToken(req);
        if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid or missing token' });

        const learner = await Learner.findOne({ userId: decoded.id });
        if (!learner) return res.status(404).json({ message: 'User not found' });

        const roleId = learner._id;

        // Count sessions where learner is in the learners array
        const [ totalSessions, oneOnOneSessions, groupSessions ] = await Promise.all([
            Schedule.countDocuments({ learners: roleId }),
            Schedule.countDocuments({ learners: roleId, sessionType: 'one-on-one' }),
            Schedule.countDocuments({ learners: roleId, sessionType: 'group' })
        ]);

        // Get learner's subjects of interest
        const learnerSubjects = learner.subjects || [];

        // Count completed sessions for each subject of interest
        const now = new Date();
        const subjectsOfInterest = await Promise.all(
            learnerSubjects.map(async (subject) => {
                const count = await Schedule.countDocuments({
                    learners: roleId,
                    subject: subject,
                    date: { $lt: now }
                });
                return { subject, count };
            })
        );

        // Fetch recent schedules with mentor details
        const schedulesAgg = await Schedule.aggregate([
            { $match: { learners: roleId } },
            { $sort: { date: -1 } },
            { $limit: 6 },
            { $lookup: {
                from: 'mentors',
                localField: 'mentor',
                foreignField: '_id',
                as: 'mentorDoc'
            }},
            { $unwind: { path: '$mentorDoc', preserveNullAndEmptyArrays: true } },
            { $project: {
                date: 1,
                time: 1,
                subject: 1,
                sessionType: 1,
                mentorName: 1,
                mentorDoc: 1,
                location: 1
            }}
        ]);

        const durationMap = { '1hr': '60 min', '2hrs': '120 min', '3hrs': '180 min' };

        const schedules = schedulesAgg.map(s => {
            const date = s.date;
            const subject = s.subject || 'Unknown';
            const mentorName = s.mentorName || (s.mentorDoc ? s.mentorDoc.name : 'Unknown');

            // Get duration from mentor or learner
            const mentorDur = s.mentorDoc ? s.mentorDoc.sessionDur : null;
            const rawDur = mentorDur || learner.sessionDur || null;
            const duration = rawDur ? (durationMap[rawDur] || rawDur) : 'N/A';

            const type = s.sessionType || 'N/A';
            const location = s.location || 'N/A';

            const status = (date instanceof Date && date < now) ? 'COMPLETED' : 'SCHEDULED';

            return {
                id: s._id,
                date,
                time: s.time,
                subject,
                mentor: mentorName,
                duration,
                type,
                location,
                status
            };
        });

        return res.status(200).json({
            data: {
                totalSessions,
                oneOnOneSessions,
                groupSessions,
                subjectsOfInterest,
                schedules
            }
        });
    } catch (err) {
        console.error('Error fetching learner dashboard:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function chatSummarize(req, res) {
    const decoded = getValuesFromToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decoded.id;
    const mode = 'summary';
    
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'message is required for summarization' });
        }

        const systemInstruction =
            'You are MindMate AI Study Assistant. Be concise, friendly, and helpful. ' +
            'Your task is to summarize lesson text concisely for quick review. ' +
            'Avoid making up data. If uncertain, ask a clarifying question.';

        const context = 'Task: Summarize the user-provided lesson text concisely for quick review.';

        const reply = await generateAIResponse({ 
            system: systemInstruction,
            user: message,
            context
        });

        return res.json({ reply, mode });
    } catch (error) {
        console.error('[AI] chatSummarize error:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({ 
            error: statusCode === 429 ? 'AI service quota exceeded. Please try again later.' : 'Internal Server Error'
        });
    }
}

async function chatAssist(req, res) {
    const decoded = getValuesFromToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decoded.id;
    const mode = 'assist';

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const systemInstruction =
            'You are MindMate AI Study Assistant. Be concise, friendly, and helpful. ' +
            'Capabilities: (1) brief Q&A about platform usage, (2) answer study questions to the best of your ability. ' +
            'Avoid making up data. If uncertain, ask a clarifying question.';

        const context = 
            'You are MindMate\'s AI Study Assistant. Answer questions about the platform and general study help briefly.';

        const reply = await generateAIResponse({ 
            system: systemInstruction,
            user: message,
            context
        });

        return res.json({ reply, mode });
    } catch (error) {
        console.error('[AI] chatAssist error:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({ 
            error: statusCode === 429 ? 'AI service quota exceeded. Please try again later.' : 'Internal Server Error'
        });
    }
}

async function chatSchedule(req, res) {
    const decoded = getValuesFromToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decoded.id;
    const mode = 'schedule';
    
    try {
        const { message } = req.body;

        // Detect intent to extract date range using node-nlp
        let dateRange = null;
        let detectedIntent = 'schedule.view';
        
        try {
            const { NlpManager } = require('node-nlp');
            const tempNlp = new NlpManager({ languages: ['en'] });
            const response = await tempNlp.process('en', message || 'show schedule');
            if (response.intent && response.intent.startsWith('schedule.')) {
                detectedIntent = response.intent;
                const { extractDateRange } = require('../service/ai');
                dateRange = extractDateRange(response.intent, message);
            }
        } catch (nlpErr) {
            console.warn('[AI] NLP intent detection failed, using default:', nlpErr.message);
        }
        
        // Fetch user's upcoming schedules with optional date filter
        const list = await getUpcomingSchedulesForUser(userId, dateRange);
        
        let context = '';
        if (!list.length) {
            context = dateRange 
                ? 'No sessions found for the requested time period.'
                : 'No upcoming sessions found.';
        } else {
            // Determine user role for proper context formatting
            const learnerDoc = await Learner.findOne({
                $or: [{ _id: userId }, { userId: userId }]
            });
            
            const mentorDoc = await Mentor.findOne({
                $or: [{ _id: userId }, { userId: userId }]
            });

            const isLearner = !!learnerDoc;
            const isMentor = !!mentorDoc;
            
            // Format schedules in a readable way
            const formattedEntries = list.map((s, i) => {
                const dateStr = new Date(s.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                let entry = `${i + 1}. ${s.subject}`;
                entry += `\n   📅 ${dateStr} at ${s.time}`;
                entry += `\n   📍 ${s.location}`;
                
                if (s.sessionType === 'group') {
                    entry += `\n   👥 Group session: ${s.groupName || 'Unnamed group'}`;
                    entry += ` (${s.participantCount}${s.maxParticipants ? `/${s.maxParticipants}` : ''} participants)`;
                    
                    // Show mentor or first participant depending on role
                    if (isLearner) {
                        entry += `\n   👤 Mentor: ${s.mentorName}`;
                    } else {
                        entry += `\n   👥 Participants: ${s.allLearnerNames?.slice(0, 3).join(', ')}${s.participantCount > 3 ? '...' : ''}`;
                    }
                } else {
                    // One-on-one session
                    if (isLearner && !isMentor) {
                        // Pure learner: show mentor
                        entry += `\n   👤 Mentor: ${s.mentorName}`;
                    } else if (isMentor && !isLearner) {
                        // Pure mentor: show learner
                        entry += `\n   👤 Learner: ${s.learnerName}`;
                    } else {
                        // Both roles: show both
                        entry += `\n   👤 Mentor: ${s.mentorName}`;
                        entry += `\n   👤 Learner: ${s.learnerName}`;
                    }
                }
                
                return entry;
            });
            
            context = formattedEntries.join('\n\n');
        }

        const systemInstruction =
            'You are MindMate AI Study Assistant. Be concise, friendly, and helpful. ' +
            'Your task is to help users with their schedule information. ' +
            'Present the schedule details clearly as provided in the context. ' +
            'If asked about specific dates, mention them naturally in your response. ' +
            'Avoid making up data. If uncertain, ask a clarifying question.';

        const prompt = message || 'Show me my upcoming sessions.';

        const result = await generateAIResponse({ 
            system: systemInstruction,
            user: prompt,
            context,
            intent: detectedIntent
        });

        return res.json({ reply: result.answer, mode });
    } catch (error) {
        console.error('[AI] chatSchedule error:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({ 
            error: statusCode === 429 ? 'AI service quota exceeded. Please try again later.' : 'Internal Server Error'
        });
    }
}

async function chatMotivate(req, res) {
    const decoded = getValuesFromToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = decoded.id;
    const mode = 'motivation';
    
    try {
        const systemInstruction =
            'You are MindMate AI Study Assistant. Be concise, friendly, and helpful. ' +
            'Your task is to provide motivational support for students. ' +
            'Keep messages positive, specific, and encouraging.';

        const context = 'Task: Provide a short, positive, specific motivational message for studying.';
        
        const prompt = 'Please send a short motivational note.';

        const reply = await generateAIResponse({ 
            system: systemInstruction,
            user: prompt,
            context
        });

        return res.json({ reply, mode });
    } catch (error) {
        console.error('[AI] chatMotivate error:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({ 
            error: statusCode === 429 ? 'AI service quota exceeded. Please try again later.' : 'Internal Server Error'
        });
    }
}

exports.chat = async function chat(req, res) {
    const { mode } = req.body || {};
    switch (mode) {
      case 'assist':
        return chatAssist(req, res);
      case 'summary':
        return chatSummarize(req, res);
      case 'schedule':
        return chatSchedule(req, res);
      case 'motivation':
        return chatMotivate(req, res);
      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }
}