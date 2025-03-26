const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res
			.status(401)
			.json({ message: "Access denied. No token provided." });
	}

	try {
		const verified = jwt.verify(
			token.replace("Bearer ", ""),
			process.env.JWT_SECRET
		);
		req.user = verified;
		next();
	} catch (error) {
		res.status(400).json({ message: "Invalid token" });
	}
};

module.exports = authMiddleware;
