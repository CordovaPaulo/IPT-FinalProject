const mailing = require('../service/mailing');
const User = require('../models/User')
const Learner = require('../models/Learner')
const Mentor = require('../models/Mentor')

exports.sendEmailNotification = async (to, subject, text) => { 
    try {
        if (!to) {
            throw new Error("Recipient email address is required");
        }
        
        await mailing.sendEmail(to, subject, text);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}