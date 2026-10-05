const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  teacherId: String,
  project_name: String,
  project_type: String,
  project_description: String,
  project_domain: String,
  cg_cutoff: { type: Number, default: 0, min: 0, max: 10 },
  project_slots: { type: Number, default: 1, min: 0 },
  filled_slots: { type: Number, default: 0, min: 0 },
  pre_requisites: Array,
  finalized_students: Array
});

const projectdb = mongoose.model("project", projectSchema);

module.exports = projectdb;
