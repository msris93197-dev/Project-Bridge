// Import necessary modules
const mongoose = require("mongoose");

// Define schema for Request
const requestSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  requests: [
    {
      studentId: { type: String, required: true },
      reason_to_do_project: { type: String, required: true },
      pre_requisites_fullfilled: { type: [String], required: true },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    },
  ],
  
});

// Create model from schema
const requestsdb = mongoose.model("requests", requestSchema);

module.exports = requestsdb;
