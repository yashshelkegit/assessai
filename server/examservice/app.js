
const express = require("express");
const axios = require("axios");
const quizRoutes = require("./routes/quizRoutes")

const app = express();
const PORT = 4000; 

app.use(express.json());

// Endpoint to get quiz data
app.post("/quiz", quizRoutes);

// Health check endpoint
app.get("/", (req, res) => {
	res.send("Node.js API is running.");
});

app.listen(PORT, () => {
	console.log(`Node.js API running at http://localhost:${PORT}`);
});

