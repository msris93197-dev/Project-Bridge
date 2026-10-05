const requestsdb = require("../model/requestSchema");
const studentdb = require("../model/studentSchema");
const teacherdb = require("../model/teacherSchema");
const projectdb = require("../model/projectSchema");
const { notify } = require("./notificationController");

exports.getData = async (req, res) => {
    // Logic for fetching Teacher data
    try {
        const teacherId = req.params.userId;
        // Create the profile on first visit so the page never dead-ends
        const teacher = await teacherdb.findOneAndUpdate(
          { teacherId },
          { $setOnInsert: { teacherId, name: req.user.displayName || "", block: "", roomNumber: "", department: "" } },
          { new: true, upsert: true }
        );

        res.status(200).json(teacher);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
};

exports.updateData = async (req, res) => {
    // Logic for updating Teacher data
    try {
        const teacherId = req.params.userId;
        const { name, block, roomNumber, department } = req.body;

        if (!name || !String(name).trim()) {
          return res.status(400).json({ error: "Name is required" });
        }
        if (roomNumber && !/^\d{1,3}$/.test(String(roomNumber))) {
          return res.status(400).json({ error: "Room number must be 1-3 digits" });
        }
    
        const updatedTeacher = await teacherdb.findOneAndUpdate(
          { teacherId },
          { name, block, roomNumber, department },
          { new: true }
        );
    
        if (!updatedTeacher) {
          res.status(404).json({ error: "Teacher not found" });
          return;
        }
    
        res.status(200).json(updatedTeacher);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
};

exports.projectRequests = async (req, res) => {
  try {
    const teacherId = req.params.userId;

    // Step 1: Retrieve projects for the given teacherId
    const projects = await projectdb.find({ teacherId });

    if (!projects || projects.length === 0) {
        return res.json([]);
    }

    // Initialize data array to store results
    const data = [];

    // Iterate through projects
    for (const project of projects) {
        const projectId = project._id;

        // Retrieve requests for the current project
        const projectRequests = await requestsdb.findOne({ projectId });

        // Check if no requests found for the project
        if (!projectRequests) {
            // Push project data without requests
            data.push({
                project,
                requestsData: []
            });
            continue; // Skip to next iteration
        }

        // Retrieve student info for each request along with additional fields from requestsdb
        const requestsData = [];
        for (const request of projectRequests.requests.filter((r) => r.status !== "withdrawn")) {
            const studentId = request.studentId;

            // Retrieve student info for the current request
            const studentInfo = await studentdb.findOne({ studentId });
            if (!studentInfo) continue; // student record no longer exists

            // Get additional fields from requestsdb
            const requestData = {
                studentId,
                studentInfo,
                reason_to_do_project: request.reason_to_do_project,
                pre_requisites_fulfilled: request.pre_requisites_fullfilled,
                status: request.status
            };

            requestsData.push(requestData);
        }

        // Push project data with requests
        data.push({
            project,
            requestsData
        });
    }

    res.json(data);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}
};

exports.updateRequestStatus = async (req, res) => {
  const { projectId, studentId } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const requestDoc = await requestsdb.findOne({ projectId });
    const request = requestDoc && requestDoc.requests.find((r) => r.studentId === studentId);
    if (!request) {
      return res.status(404).json({ message: "Student request not found for this project" });
    }

    const previous = request.status;
    if (previous === "withdrawn") {
      return res.status(409).json({ message: "Request was withdrawn by the student" });
    }
    if (previous === status) {
      return res.json({ message: "Request status unchanged" });
    }

    if (status === "approved") {
      const approvedElsewhere = await requestsdb.exists({
        projectId: { $ne: projectId },
        requests: { $elemMatch: { studentId, status: "approved" } },
      });
      if (approvedElsewhere) {
        return res.status(409).json({ message: "Student is already approved for another project" });
      }

      // Claim a slot atomically so concurrent approvals can never overfill the project
      const claimed = await projectdb.findOneAndUpdate(
        { _id: projectId, $expr: { $lt: ["$filled_slots", "$project_slots"] } },
        { $inc: { filled_slots: 1 }, $push: { finalized_students: studentId } }
      );
      if (!claimed) {
        const exists = await projectdb.exists({ _id: projectId });
        return exists
          ? res.status(409).json({ message: "Slots filled already" })
          : res.status(404).json({ message: "Project not found" });
      }
    } else if (previous === "approved") {
      await projectdb.updateOne(
        { _id: projectId },
        { $inc: { filled_slots: -1 }, $pull: { finalized_students: studentId } }
      );
    }

    await requestsdb.updateOne(
      { projectId, "requests.studentId": studentId },
      { $set: { "requests.$.status": status } }
    );

    const project = req.project || (await projectdb.findById(projectId));
    const label = { approved: "approved", rejected: "rejected", pending: "moved back to pending" }[status];
    await notify(studentId, `Your request for "${project ? project.project_name : "a project"}" was ${label}.`, `/students/StudentHome/${studentId}`);

    res.json({ message: "Request status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.updateRequestStatus = async (req, res) => {
//   try {
//     const { projectId, studentId } = req.params;
//     const { status } = req.body;
//     console.log("projectId:", projectId)
//     // Find the document matching projectId
//     const projectRequest = await requestsdb.findOne({ projectId });

//     if (!projectRequest) {
//       return res.status(404).json({ message: 'Project request not found' });
//     }

//     // Find the request in the requests array with matching studentId
//     const request = projectRequest.requests.find(req => req.studentId === studentId);

//     if (!request) {
//       return res.status(404).json({ message: 'Student request not found for this project' });
//     }

//     // Update the status of the request
//     request.status = status;
//     await projectRequest.save();

//     res.json({ message: 'Request status updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };