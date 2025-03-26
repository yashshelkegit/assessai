const express = require("express")
const Areas = require("../models/Areas")

const router = express()

router.get("/get/:email/:subject", async (req, res) => {
    console.log("Received body:", req.params);
});


router.post("/store", async (req, res) => {
	console.log(req.body);
});

module.exports = router;