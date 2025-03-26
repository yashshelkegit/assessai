require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const syllabusRoutes = require("./routes/syllabusRoute");

const app = express();
const PORT = process.env.PORT || 3002;


app.use(express.json());
app.use(cors())

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err));


app.use("/api/syllabus", syllabusRoutes);

app.get("/", (req, res) => {
	res.send("Welcome to the Syllabus API!");
});

// Start Server
app.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
