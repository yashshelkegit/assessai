const express = require("express")
const nodemailer = require("nodemailer");


const router = express.Router()

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "yashshelke885@gmail.com",
		pass: "oaxw pdcv rhgp omhs", // Consider storing this securely using environment variables
	},
});

router.post("/send", async (req, res)=>{
    const {user, content} = req.body
    console.log(req.body)

    try {
			const mailOptions = {
				from: "yashshelke885@gmail.com",
				to: user,
				subject: "Your Learning Feedback and Analysis",
				html: `
                <h1>Learning Feedback and Analysis</h1>
                <p>Dear Student,</p>
                <h2>Personalized Feedback</h2>
                <div style="padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${content}
                </div>`,
			};
			await transporter.sendMail(mailOptions);
			res.status(200).json({ message: "Email sent successfully" });
		} catch (error) {
			console.error("Error sending email:", error);
			res
				.status(500)
				.json({ message: "Failed to send email", error: error.message });
		}
})

module.exports = router