const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    teacherId: String,
    name: String,
    block: String,
    roomNumber: String,
    department: String
});

const teacherdb = mongoose.model("teacher", teacherSchema);

module.exports = teacherdb;
