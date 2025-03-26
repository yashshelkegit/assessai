// routes/videos.js
const express = require("express");
const router = express.Router();
const Video = require("../models/Video");

// GET all videos
router.get("/", async (req, res) => {
	try {
		const videos = await Video.find().sort({ createdAt: -1 });
		res.json(videos);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/subjects", async (req, res) => {
	try {
		console.log("subject");
		const subjects = await Video.distinct("subject");
		res.json(subjects);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const video = await Video.findById(req.params.id);
		if (!video) {
			return res.status(404).json({ message: "Video not found" });
		}
		res.json(video);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET videos by subject
router.get("/subject/:subject", async (req, res) => {
	try {
		const videos = await Video.find({
			subject: req.params.subject,
		}).sort({ createdAt: -1 });

		res.json(videos);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST create new video
router.post("/", async (req, res) => {
	const { subject, topic, videoLink } = req.body;

	// Validate request
	if (!subject || !topic || !videoLink) {
		return res
			.status(400)
			.json({ message: "Subject, topic, and videoLink are required" });
	}

	try {
		const newVideo = new Video({
			subject,
			topic,
			videoLink,
		});

		const savedVideo = await newVideo.save();
		res.status(201).json(savedVideo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});


// DELETE a video
// router.delete("/:id", async (req, res) => {
// 	try {
// 		const video = await Video.findByIdAndDelete(req.params.id);

// 		if (!video) {
// 			return res.status(404).json({ message: "Video not found" });
// 		}

// 		res.json({ message: "Video deleted successfully" });
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// });

module.exports = router;
