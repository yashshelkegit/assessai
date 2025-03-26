const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
	id: Number,
	type: String,
	topic: String,
	question: String,
	options: [String],
});

const subjectScoreSchema = new mongoose.Schema({
	user: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
		required: true,
	},
	submittedAt: {
		type: Date,
		default: Date.now,
	},
	score: {
		type: Number,
		required: true,
	},
	questions: [questionSchema],
	answers: {
		type: Map,
		of: mongoose.Schema.Types.Mixed,
	},
	explanations: mongoose.Schema.Types.Mixed,
});
const SubjectScore = mongoose.model("SubjectScore", subjectScoreSchema);
module.exports = SubjectScore;
