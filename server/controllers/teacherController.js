const requestsdb = require("../model/requestSchema");
const studentdb = require("../model/studentSchema");
const teacherdb = require("../model/teacherSchema");
const projectdb = require("../model/projectSchema");

exports.getData = async (req, res) => {
    // Logic for fetching Teacher data
    try {
        const teacherId = req.params.userId;
        const teacher = await teacherdb.findOne({ teacherId });
    
        if (!teacher) {
          res.status(404).json({ error: "Teacher not found" });
          return;
        }
    
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

    // Check if no projects found
    if (!projects || projects.length === 0) {
        return res.status(404).json({ message: 'No projects found for the given teacher' });
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
        for (const request of projectRequests.requests) {
            const studentId = request.studentId;

            // Retrieve student info for the current request
            const studentInfo = await studentdb.findOne({ studentId });

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
  try {
    const { projectId, studentId } = req.params;
    const { status } = req.body;

    // Find the document matching projectId
    const projectRequest = await requestsdb.findOne({ projectId });

    if (!projectRequest) {
      return res.status(404).json({ message: 'Project request not found' });
    }

    // Find the request in the requests array with matching studentId
    const request = projectRequest.requests.find(req => req.studentId === studentId);

    if (!request) {
      return res.status(404).json({ message: 'Student request not found for this project' });
    }

    // Update the status of the request
    request.status = status;
    await projectRequest.save();

    console.log('Request status updated successfully');

    // Check if the status is "accepted"
    if (status === "accepted") {
      // Find the project in the projectdb using the projectId
      const project = await projectdb.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if slots are filled
      if (parseInt(project.filled_slots) >= parseInt(project.project_slots)) {
        console.log('Slots filled already');
        return res.status(400).json({ message: 'Slots filled already' });
      }

      // Increase filled slots and update finalized_students array
      project.filled_slots = (parseInt(project.filled_slots) + 1).toString();
      project.finalized_students.push(studentId);

      await project.save();

      console.log('Project slots updated successfully');
    }

    res.json({ message: 'Request status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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