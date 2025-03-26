const express = require("express");
require("dotenv").config();
const cors = require("cors")
const mongoose = require('mongoose');
const assessmentsRoutes = require("./routes/assessmentRoutes")
const pathRoutes = require("./routes/pathRoutes")
const emailRoutes = require("./routes/emailRoutes")
const activationRoutes = require("./routes/testActivationRoutes")
const areaRoutes = require("./routes/areaRoutes")
const videoRoutes = require("./routes/videoRoutes")


app = express();
app.use(cors())
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
.then(()=>{console.log("connected to db")})

app.use("/assessments", assessmentsRoutes)
app.use("/learning-path", pathRoutes)
app.use("/email", emailRoutes)
app.use("/activation", activationRoutes)
app.use("/areas", areaRoutes)
app.use("/videos", videoRoutes)


app.listen(3003, () => {
	console.log(3003);
});
