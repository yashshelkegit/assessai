const router = require("express").Router();
const User = require("../models/User");


router.get("/all", async (req, res)=>{
	try {
		const users = await User.find();
		console.log(users)
		res.json(users)
	} catch (error) {
		console.log(error)
	}
})
router.get("/profile/:email", async (req, res) => {
	try {
		const user = await User.findOne({email:req.params.email}).select("-password");
		// console.log(user)
		res.json(user);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching profile", error: error.message });
	}
});

router.post("/update-competency", async (req, res) => {
	console.log(req.body)
	try {
		const user = await User.findOne({email:req.body.user});
		user.competency = req.body.cluster.prediction;
		user.save()
		res.json(user);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching profile", error: error.message });
	}
});

module.exports = router