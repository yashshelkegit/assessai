// learningPathSchema.js
const mongoose = require("mongoose");

const activationSchema = new mongoose.Schema({
    name: String,
    activation: Boolean,
});

const activationModal = mongoose.model("Activation", activationSchema)

module.exports = activationModal