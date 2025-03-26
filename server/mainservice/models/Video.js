// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
	subject: {
		type: String,
		required: true,
		trim: true,
	},
	topic: {
		type: String,
		required: true,
		trim: true,
	},
	videoLink: {
		type: String,
		required: true,
		trim: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

videoSchema.index({ subject: 1 });
videoSchema.index({ topic: 1 });

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
