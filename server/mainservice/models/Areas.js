const mongoose = require("mongoose")

const areasSchema = mongoose.Schema({
    user: String,
    subject: String,
    strong: [String],
    weak: [String],
    unevaluated: [String]
})

const Areas = mongoose.model("Areas", areasSchema)

module.exports = Areas