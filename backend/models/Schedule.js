const mongoose = require('mongoose');
// const Mentor = require('./Mentor');
// const Learner = require('./Learner');

const scheduleSchema = new mongoose.Schema({
    // learners: array of Learner ObjectIds. Validation ensures
    // - one-on-one sessions have exactly 1 learner
    // - group sessions allow 1+ learners (first accept creates schedule; others join)
    learners: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Learner' }],
        required: true,
        validate: {
            validator: function (arr) {
                // When validating, `this` refers to the document
                const sessionType = this.sessionType;
                if (!Array.isArray(arr)) return false;
                if (sessionType === 'one-on-one') {
                    return arr.length === 1;
                } else if (sessionType === 'group') {
                    // allow creating a group schedule with 1+ learners so mentor can send offers
                    // and learners can join incrementally
                    return arr.length >= 1;
                }
                // default fallback: require at least one learner
                return arr.length >= 1;
            },
            message: props => {
                const st = props && props.instance && props.instance.sessionType;
                if (st === 'one-on-one') return 'One-on-one sessions must have exactly one learner.';
                if (st === 'group') return 'Group sessions must have one or more learners.';
                return 'At least one learner is required.';
            }
        }
    },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    mentorName: { type: String, required: true },
    // store learner display names as an array to match learners[] shape
    learnerNames: { type: [String], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    subject: { type: String, required: true },
    sessionType: { type: String, enum: ['one-on-one', 'group'], required: true },
}, { collections: 'schedules' });

module.exports = mongoose.model('Schedule', scheduleSchema);
