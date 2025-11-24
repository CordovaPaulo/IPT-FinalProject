const mongoose = require('mongoose');
const Specialization = require('../models/specializations');
const UserSkillProgress = require('../models/userSkillProgress');

/**
 * Add progress for a user's skill in a specialization.
 * @param {Object} params
 * @param {string|ObjectId} params.userId
 * @param {string} params.specialization
 * @param {string} params.skill
 * @param {number} params.delta
 * @param {string} [params.source]
 * @param {string|ObjectId} [params.sourceId]
 * @param {string} [params.note]
 */
async function addProgress({ userId, specialization, skill, delta, source, sourceId, note } = {}) {
  if (!userId) throw new Error('addProgress: "userId" is required');
  if (!specialization || typeof specialization !== 'string') throw new Error('addProgress: "specialization" is required and must be a string');
  if (!skill || typeof skill !== 'string') throw new Error('addProgress: "skill" is required and must be a string');
  if (typeof delta !== 'number' || !isFinite(delta)) throw new Error('addProgress: "delta" is required and must be a finite number');

  // normalize userId to ObjectId
  let userObjectId;
  // try to coerce userId to an ObjectId when possible, otherwise keep the original value
  if (mongoose.Types.ObjectId.isValid(userId)) {
    try {
      userObjectId = mongoose.Types.ObjectId(userId);
    } catch (err) {
      // fallback to original value if coercion unexpectedly fails
      userObjectId = userId;
    }
  } else {
    userObjectId = userId;
  }

  // ensure specialization exists
  const spec = await Specialization.findOne({ specialization }).lean().exec();
  if (!spec) {
    throw new Error(`addProgress: specialization "${specialization}" not found`);
  }

  if (!Array.isArray(spec.skillmap) || !spec.skillmap.includes(skill)) {
    console.warn(`addProgress: skill "${skill}" not found in specialization "${specialization}"`);
  }

  // find or create progress doc
  let usp = await UserSkillProgress.findOne({ userId: userObjectId, specialization, skill }).exec();
  if (!usp) {
    usp = new UserSkillProgress({ userId: userObjectId, specialization, skill, score: 0, history: [], lastUpdated: new Date() });
  }

  // append history entry
  const historyEntry = { delta, source: source || undefined, note: note || undefined, at: new Date() };
  if (typeof sourceId !== 'undefined' && sourceId !== null) historyEntry.sourceId = sourceId;

  usp.history = usp.history || [];
  usp.history.push(historyEntry);

  // update score (clamp to 0 minimum)
  const newScore = (typeof usp.score === 'number' ? usp.score : 0) + delta;
  usp.score = Math.max(0, newScore);

  // save (pre-save hook will compute level)
  const saved = await usp.save();
  return saved.toObject();
}

module.exports = { addProgress };
