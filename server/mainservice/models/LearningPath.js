// learningPathSchema.js
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    name: String,
    priority: {
        type: String,
        enum: ["high", "medium", "low"],
    },
    estimated_hours: Number,
    resources: [String],
    practice_exercises: [String],
});

const learningPathSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    learning_path: {
        topics: [topicSchema],
        strong_areas: [String],
        weak_areas:[String],
        unevaluated_areas:[String],
        total_estimated_hours: Number,
        general_recommendations: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a compound index for user and subject
learningPathSchema.index({ user: 1, subject: 1 });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

module.exports = LearningPath;