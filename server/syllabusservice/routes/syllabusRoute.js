const express = require("express");
const router = express.Router();
const Syllabus = require("../models/Syllabus");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/books"); // Make sure this directory exists
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({ storage: storage });

// Create syllabus
router.post("/create", async (req, res) => {
	try {
		const { sub, chapters = [] } = req.body;
		const syllabus = new Syllabus({
			sub,
			chapters,
			books: [],
		});
		const savedSyllabus = await syllabus.save();
		res.status(201).json(savedSyllabus);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all syllabi
router.get("/", async (req, res) => {
	try {
		const syllabi = await Syllabus.find();
		res.json(syllabi);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/subject-list", async (req, res) => {
	try {
		const syllabi = await Syllabus.find();
		res.json(syllabi);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/subject-list/email/:email", async (req, res) => {
	try {
		const email = req.params.email;
		const response = await fetch("http://localhost:3000/user/profile/" + email);
		const data = await response.json();
		const backlogSubjects = data?.backlogSubjects || [];
		console.log(backlogSubjects)

		if (!backlogSubjects.length) {
			return res.json([]);
		}

		const syllabi = await Syllabus.find({
			sub: { $in: backlogSubjects },
		});

		res.json(syllabi);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get syllabus by subject
router.get("/:sub", async (req, res) => {
	try {
		const syllabus = await Syllabus.findOne(
			{ sub: req.params.sub },
			{ _id: 0, __v: 0, books: 0 }
		);
		if (!syllabus)
			return res.status(404).json({ message: "Syllabus not found" });
		res.json(syllabus);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update syllabus
router.put("/:id", async (req, res) => {
	try {
		const { sub, chapters } = req.body;
		const updatedSyllabus = await Syllabus.findByIdAndUpdate(
			req.params.id,
			{ sub, chapters },
			{ new: true }
		);
		if (!updatedSyllabus)
			return res.status(404).json({ message: "Syllabus not found" });
		res.json(updatedSyllabus);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload books for a syllabus
router.post("/:id/books", upload.array("books"), async (req, res) => {
	try {
		const files = req.files;
		const syllabus = await Syllabus.findById(req.params.id);

		if (!syllabus)
			return res.status(404).json({ message: "Syllabus not found" });

		const newBooks = files.map((file) => ({
			name: file.originalname,
			path: file.path,
			id: Date.now() + Math.random(),
		}));

		syllabus.books = [...syllabus.books, ...newBooks];
		await syllabus.save();

		res.json(syllabus);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete book from syllabus
router.delete("/:id/books/:bookId", async (req, res) => {
	try {
		const syllabus = await Syllabus.findById(req.params.id);

		if (!syllabus)
			return res.status(404).json({ message: "Syllabus not found" });

		syllabus.books = syllabus.books.filter(
			(book) => book.id !== req.params.bookId
		);
		await syllabus.save();

		res.json(syllabus);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete syllabus
router.delete("/:id", async (req, res) => {
	try {
		const deletedSyllabus = await Syllabus.findByIdAndDelete(req.params.id);
		if (!deletedSyllabus)
			return res.status(404).json({ message: "Syllabus not found" });
		res.json({ message: "Syllabus deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
