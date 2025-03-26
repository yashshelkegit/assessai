const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	college: {
		type: String,
		required: true,
	},
	competency: {
		type: String,
		required: true,
		enum: ["bright", "average", "poor"],
	},
	backlogSubjects: [
		{
			type: String,
		},
	],
});

userSchema.pre("save", function (next) {
	this.name = this.name.toLowerCase();
	this.email = this.email.toLowerCase();
	this.college = this.college.toLowerCase();
	this.competency = this.competency.toLowerCase();
	next();
}); 

module.exports = mongoose.model("User", userSchema);
