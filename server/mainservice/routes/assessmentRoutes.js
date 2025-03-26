const express = require("express");
const SubjectScore = require("../models/SubjectScore");
const axios = require("axios");
const router = express();

router.post("/aptitude-score", async (req, res) => {
	console.log("Received body:", req.body.scores);
	const { quant, verbal, logic } = req.body.scores;
	console.log({ quant, verbal, logic });
	try {
		const cluster = await axios.post("http://127.0.0.1:8000/predict", {
			quant,
			verbal,
			logic,
		});
		const response = await axios.post(
			"http://127.0.0.1:3000/user/update-competency",
			{ user: req.body.user, cluster: cluster.data }
		);
		res.json({ cluster: cluster.data });
	} catch (err) {
		console.error("Error fetching prediction:", err.message);
		res.status(500).json({ error: "Failed to fetch prediction" });
	}
});

router.post("/subject-score", async (req, res) => {
	try {
		const { user, scores, questions, answers, subject } = req.body;
		axios.post("http://127.0.0.1:3001/learning-path", {
			body: { user, scores, questions, answers, subject },
		});

		// Create explanations map from scores.explanation object
		const explanations = scores.explanation; // Store explanation object directly

		// Create answers map from answers object
		const answersMap = new Map();
		Object.entries(answers).forEach(([key, value]) => {
			answersMap.set(key, value);
		});

		// Create new score entry with complete exam data
		const newScore = new SubjectScore({
			user,
			subject,
			score: scores.score,
			questions,
			answers: answersMap,
			explanations, // Store as a single string/object instead of character map
		});

		// Save the new score
		await newScore.save();

		// Keep only the 3 most recent scores for this user and subject
		const allScores = await SubjectScore.find({
			user,
			subject,
		}).sort({ submittedAt: -1 });

		// If more than 3 scores exist, delete the older ones
		if (allScores.length > 3) {
			const scoresToDelete = allScores.slice(3);
			await SubjectScore.deleteMany({
				_id: { $in: scoresToDelete.map((score) => score._id) },
			});
		}

		res.status(201).json({
			message: "Score saved successfully",
			data: newScore,
		});
	} catch (error) {
		console.error("Error saving subject score:", error);
		res.status(500).json({
			message: "Error saving score",
			error: error.message,
		});
	}
});
router.post("/subject-scores/update/:id", async (req, res) => {
	try {
		// console.log(req.body)
		const record = await SubjectScore.findOne({
			_id: req.params.id,
		});
		record.score = Number(req.body.updatedScore);
		record.explanations =
			record.explanations + `Edited:${req.body.updatedExplanation}`;
		record.save();
		res.json(record);
	} catch (error) {
		console.error("Error fetching subject scores:", error);
		res.status(500).json({
			message: "Error fetching subject scores",
			error: error.message,
		});
	}
});

// Get scores for a user
router.get("/subject-scores/:email", async (req, res) => {
	try {
		const scores = await SubjectScore.find({
			user: req.params.email,
		});
		// .limit();

		res.json(scores);
	} catch (error) {
		console.error("Error fetching subject scores:", error);
		res.status(500).json({
			message: "Error fetching subject scores",
			error: error.message,
		});
	}
});

router.get("/subject-scores/recent/:email", async (req, res) => {
	try {
		const scores = await SubjectScore.find({
			user: req.params.email,
		})
			.sort({ submittedAt: -1 })
			.limit(3);

		console.log(scores);
		res.json(scores);
	} catch (error) {
		console.error("Error fetching subject scores:", error);
		res.status(500).json({
			message: "Error fetching subject scores",
			error: error.message,
		});
	}
});

// Get scores for a specific subject and user
router.get("/subject-scores/:email/:subject", async (req, res) => {
	try {
		const scores = await SubjectScore.find({
			user: req.params.email,
			subject: req.params.subject,
		}).sort({ submittedAt: -1 });

		res.json(scores);
	} catch (error) {
		console.error("Error fetching subject scores:", error);
		res.status(500).json({
			message: "Error fetching subject scores",
			error: error.message,
		});
	}
});

module.exports = router;
