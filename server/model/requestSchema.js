const mongoose = require("mongoose");

const REQUEST_STATUSES = ["pending", "approved", "rejected", "withdrawn"];

const requestSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  requests: [
    {
      studentId: { type: String, required: true },
      reason_to_do_project: { type: String, required: true },
      pre_requisites_fullfilled: { type: [String], required: true },
      status: { type: String, enum: REQUEST_STATUSES, default: "pending" },
    },
  ],
});

const requestsdb = mongoose.model("requests", requestSchema);

module.exports = requestsdb;
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;
