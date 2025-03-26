const express = require("express");
const router = express.Router();
const LearningPath = require("../models/LearningPath")

// Store learning path
router.post("/store", async (req, res) => {
	try {
		// const { user, subject, learning_path, assessment_summary } = req.body;
		const { user, subject, learning_path } = req.body;
        console.log(req.body)

		let existingPath = await LearningPath.findOne({ user, subject });

		if (existingPath) {
			existingPath.learning_path = learning_path;
			// existingPath.assessment_summary = assessment_summary;
			existingPath.updatedAt = Date.now();
			await existingPath.save();

			return res.status(200).json({
				message: "Learning path updated successfully",
				data: existingPath,
			});
		}

		// Create new learning path
		const newLearningPath = new LearningPath({
			user,
			subject,
			learning_path,
			// assessment_summary,
		});

		await newLearningPath.save();

		res.status(201).json({
			message: "Learning path created successfully",
			data: newLearningPath,
		});
	} catch (error) {
		console.error("Error handling learning path:", error);
		res.status(500).json({
			message: "Error processing learning path",
			error: error.message,
		});
	}
});

router.get("/:user/:subject", async (req, res) => {
	try {
		const { user, subject } = req.params;

		const learningPath = await LearningPath.findOne({
			user,
			subject,
		}).sort({ updatedAt: -1 });

		if (!learningPath) {
			return res.status(200).json({
				message: "First give the assessments then Learning Path will be generated",
			});
		}

		// Transform the data to match the expected frontend structure
		const transformedData = {
			message: "Learning path retrieved successfully",
			data: {
				_id: learningPath._id,
				user: learningPath.user,
				subject: learningPath.subject,
				learning_path: {
					topics: learningPath.learning_path.topics.map((topic) => ({
						name: topic.name,
						priority: topic.priority,
						estimated_hours: topic.estimated_hours,
						resources: topic.resources,
						practice_exercises: topic.practice_exercises,
					})),
					strong_areas: learningPath.learning_path.strong_areas,
					weak_areas: learningPath.learning_path.weak_areas,
					unevaluated_areas: learningPath.learning_path.unevaluated_areas,
					total_estimated_hours:
						learningPath.learning_path.total_estimated_hours,
					general_recommendations:
						learningPath.learning_path.general_recommendations,
				},
				createdAt: learningPath.createdAt,
				updatedAt: learningPath.updatedAt,
			},
		};

		res.status(200).json(transformedData);
	} catch (error) {
		console.error("Error retrieving learning path:", error);
		res.status(500).json({
			message: "Error retrieving learning path",
			error: error.message,
		});
	}
});

router.get("/topics", async (req, res) => {
	try {
		const strongResults = await LearningPath.distinct(
			"learning_path.strong_areas"
		);
		const weakResults = await LearningPath.distinct("learning_path.weak_areas");
		const unevaluatedResults = await LearningPath.distinct(
			"learning_path.unevaluated_areas"
		);

		const topicResults = await LearningPath.distinct(
			"learning_path.topics.name"
		);

		const allTopics = [
			...new Set([
				...strongResults,
				...weakResults,
				...unevaluatedResults,
				...topicResults,
			]),
		]
			.filter(Boolean)
			.sort();

		res.json({
			count: allTopics.length,
			topics: allTopics,
		});
	} catch (error) {
		console.error("Error fetching topics:", error);
		res.status(500).json({ error: "Server error fetching topics" });
	}
});

router.get("/by-topic", async (req, res) => {
	try {
		const { topic, areas } = req.query;

		if (!topic) {
			return res.status(400).json({ error: "Topic parameter is required" });
		}

		// Default to all areas if not specified
		const areasToSearch = areas
			? areas.split(",").map((area) => area.trim())
			: ["strong_areas", "weak_areas", "unevaluated_areas"];

		// Validate areas
		const validAreas = ["strong_areas", "weak_areas", "unevaluated_areas"];
		const invalidAreas = areasToSearch.filter(
			(area) => !validAreas.includes(area)
		);

		if (invalidAreas.length > 0) {
			return res.status(400).json({
				error: `Invalid areas: ${invalidAreas.join(
					", "
				)}. Valid values are: ${validAreas.join(", ")}`,
			});
		}

		// Build query with $or operator to search across specified areas
		const query = {
			$or: areasToSearch.map((area) => ({
				[`learning_path.${area}`]: topic,
			})),
		};

		// Find learning paths matching the query
		const results = await LearningPath.find(query)
			.select(
				"user subject learning_path.strong_areas learning_path.weak_areas learning_path.unevaluated_areas"
			)
			.lean();

		// Transform results to provide a clean response with just the student info
		const students = results.map((path) => {
			// Determine which areas contain the topic
			const matchingTopics = {};

			areasToSearch.forEach((area) => {
				const areaTopics = path.learning_path[area] || [];
				if (areaTopics.includes(topic)) {
					matchingTopics[area] = [topic];
				}
			});

			return {
				user: path.user,
				subject: path.subject,
				matching_topics: matchingTopics,
			};
		});

		res.json({
			count: students.length,
			topic,
			students,
		});
	} catch (error) {
		console.error("Error finding students by topic:", error);
		res.status(500).json({ error: "Server error finding students by topic" });
	}
});

// Get all learning paths for a user
router.get("/:user/all", async (req, res) => {
	try {
		const { user } = req.params;

		const learningPaths = await LearningPath.find({
			user,
		}).sort({ updatedAt: -1 });

		if (!learningPaths.length) {
			return res.status(404).json({
				message: "No learning paths found for this user",
			});
		}

		res.status(200).json({
			message: "Learning paths retrieved successfully",
			data: learningPaths,
		});
	} catch (error) {
		console.error("Error retrieving learning paths:", error);
		res.status(500).json({
			message: "Error retrieving learning paths",
			error: error.message,
		});
	}
});

module.exports = router;
