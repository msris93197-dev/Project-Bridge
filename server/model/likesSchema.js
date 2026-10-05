const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema({
    studentId: String,
    likedProjects: Array
}, { collection: 'likesdb' });

const likesdb = mongoose.model("likesdb", likesSchema);

module.exports = likesdb;
