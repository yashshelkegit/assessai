const express = require('express');

const router = express.Router();

router.post("/competency", async (req, res) => {
	const { prompt, format } = req.body;

	if (!prompt || !format) {
		return res.status(400).json({
			status: "error",
			message: "'prompt' and 'format' fields are required.",
		});
	}

	try {
		const response = await axios.post("http://localhost:3001/chat", {
			prompt,
			format: JSON.parse(format),
		});

		return res.status(200).json({
			status: "success",
			data: response.data,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: error.message || "Failed to fetch quiz data.",
		});
	}
});

module.exports = router;