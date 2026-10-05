const requestsdb = require("../model/requestSchema");
const projectdb = require("../model/projectSchema");
const studentdb = require("../model/studentSchema");
const { notify } = require("./notificationController");

exports.storeRequest = async (req, res) => {
  try {
    const { projectId, studentId } = req.params;
    const { reason_to_do_project, pre_requisites_fullfilled = [] } = req.body;

    if (!reason_to_do_project || !reason_to_do_project.trim()) {
      return res.status(400).json({ message: "A reason for the request is required" });
    }

    const project = await projectdb.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const student = await studentdb.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (project.filled_slots >= project.project_slots) {
      return res.status(409).json({ message: "All slots for this project are filled" });
    }

    const cg = parseFloat(student.cg);
    if (Number.isNaN(cg) || cg < project.cg_cutoff) {
      return res.status(403).json({ message: "You do not meet the CG cutoff for this project" });
    }

    const allowed = new Set(project.pre_requisites || []);
    if (!pre_requisites_fullfilled.every((p) => allowed.has(p))) {
      return res.status(400).json({ message: "Invalid prerequisites selected" });
    }

    const alreadyApproved = await requestsdb.exists({
      requests: { $elemMatch: { studentId, status: "approved" } },
    });
    if (alreadyApproved) {
      return res.status(409).json({ message: "You are already approved for a project" });
    }

    const entry = { studentId, reason_to_do_project, pre_requisites_fullfilled };

    // A withdrawn request can be resubmitted
    const reopened = await requestsdb.updateOne(
      { projectId, requests: { $elemMatch: { studentId, status: "withdrawn" } } },
      {
        $set: {
          "requests.$.status": "pending",
          "requests.$.reason_to_do_project": reason_to_do_project,
          "requests.$.pre_requisites_fullfilled": pre_requisites_fullfilled,
        },
      }
    );
    if (reopened.modifiedCount === 1) {
      await notify(project.teacherId, `${student.name || "A student"} re-applied to "${project.project_name}".`, `/teachers/RequestsPage/${project.teacherId}`);
      return res.status(200).json({ message: "Request stored successfully" });
    }

    // Atomic insert: the filter fails if this student already has a request,
    // and the unique projectId index then turns the upsert into a duplicate-key error.
    try {
      await requestsdb.updateOne(
        { projectId, "requests.studentId": { $ne: studentId } },
        { $push: { requests: entry } },
        { upsert: true }
      );
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Request already exists for this project and student" });
      }
      throw error;
    }

    await notify(project.teacherId, `${student.name || "A student"} applied to "${project.project_name}".`, `/teachers/RequestsPage/${project.teacherId}`);
    res.status(200).json({ message: "Request stored successfully" });
  } catch (error) {
    console.error("Error storing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.withdrawRequest = async (req, res) => {
  try {
    const { projectId, studentId } = req.params;
    const result = await requestsdb.updateOne(
      { projectId, requests: { $elemMatch: { studentId, status: "pending" } } },
      { $set: { "requests.$.status": "withdrawn" } }
    );
    if (result.modifiedCount === 0) {
      return res.status(409).json({ message: "Only a pending request can be withdrawn" });
    }
    res.json({ message: "Request withdrawn" });
  } catch (error) {
    console.error("Error withdrawing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSentRequests = async (req, res) => {
  const { projectId, studentId } = req.params;
  try {
    const request = await requestsdb.findOne({
      projectId,
      requests: { $elemMatch: { studentId, status: { $ne: "withdrawn" } } },
    });
    res.json(request);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
