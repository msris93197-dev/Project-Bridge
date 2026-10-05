const requestsdb = require("../model/requestSchema");

exports.storeRequest = async (req, res) => {
  try {
      const { projectId, studentId } = req.params;
      const { reason_to_do_project, pre_requisites_fullfilled } = req.body;
  
      let requestDoc = await requestsdb.findOne({ projectId });
  
      if (!requestDoc) {
        requestDoc = new requestsdb({ projectId, requests: [] });
      }
  
      // Check if the request from this student already exists
      const existingRequest = requestDoc.requests.find(request => request.studentId === studentId);
      if (existingRequest) {
          return res.status(400).json({ message: "Request already exists for this project and student" });
      }

      requestDoc.requests.push({
        studentId,
        reason_to_do_project,
        pre_requisites_fullfilled,
      });
  
      await requestDoc.save();
  
      res.status(200).json({ message: "Request stored successfully" });
  } catch (error) {
      console.error("Error storing request:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSentRequests  = async (req, res) => {
  const { projectId, studentId } = req.params;
  try {
    const request = await requestsdb.findOne({
      projectId,
      "requests.studentId": studentId,
    });
    res.json(request); // Return the request if found
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
