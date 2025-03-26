const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	id: { type: String, required: true },
	name: { type: String, required: true },
	path: { type: String, required: true },
});

const chapterSchema = new mongoose.Schema({
	no: { type: Number, required: true },
	name: { type: String, required: true },
	topics: { type: [String], required: true },
	weightage: { type: Number, required: true },
});

const syllabusSchema = new mongoose.Schema({
	sub: { type: String, required: true },
	chapters: [chapterSchema],
	books: [bookSchema],
});

module.exports = mongoose.model("Syllabus", syllabusSchema);
