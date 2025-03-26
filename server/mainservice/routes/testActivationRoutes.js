const express = require("express")

const router = express()

let subjectFlag = false;
let aptitudeFlag = false;

router.get("/status", (req, res) => {
    res.json({
        subjectStatus: subjectFlag,
        aptitudeStatus: aptitudeFlag
    })
})

router.get("/aptitude-toggle", async (req, res) => {
    aptitudeFlag = !aptitudeFlag;
    console.log(aptitudeFlag);
    res.json({msg: "Aptitude activation"+aptitudeFlag})
});

router.get("/subject-toggle", async (req, res) => {
    subjectFlag = !subjectFlag;
	console.log(subjectFlag);
	res.json({ msg: "Aptitude activation" + subjectFlag });
});
module.exports = router;