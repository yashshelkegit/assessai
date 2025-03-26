const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

// Registration route
router.post("/register", async (req, res) => {
	try {
		// Check if user already exists
		const existingUser = await User.findOne({ email: req.body.email });
        console.log(req.body)
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		// Create new user
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			phone: req.body.phone,
			college: req.body.college,
			competency: req.body.competency,
			backlogSubjects: req.body.backlogSubjects,
		});

		// Save user
		const savedUser = await user.save();

		// Generate JWT token
		const token = jwt.sign({ userId: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
			},
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error registering user", error: error.message });
	}
});

// Login route
router.post("/login", async (req, res) => {
	try {
		// Check if user exists
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Validate password
		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validPassword) {
			return res.status(400).json({ message: "Invalid password" });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.json({
			message: "Logged in successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
});

// Protected profile route
router.get("/profile", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select("-password");
		res.json(user);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching profile", error: error.message });
	}
});

module.exports = router;
