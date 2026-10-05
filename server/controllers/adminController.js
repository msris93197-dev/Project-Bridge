const teacherdb = require("../model/teacherSchema");
const projectdb = require("../model/projectSchema");
const requestsdb = require("../model/requestSchema");
const userdb = require("../model/userSchema")
exports.getUserCount =  async (req, res) => {
  try {
    
    const teachersCount = await userdb.countDocuments({ user_type: 'teacher' });
    const studentsCount = await userdb.countDocuments({ user_type: 'student' });
    const totalUsers = teachersCount+studentsCount;

    res.json({ totalUsers, teachersCount, studentsCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Endpoint to get the number of projects per department
exports.getProjectsPerDepartment = async (req, res) => {
  try {
    // Fetch all projects from the database
    const projects = await projectdb.find();

    // Create a map to store department-wise project count
    const departmentCounts = new Map();

    // Count projects per department
    for (const project of projects) {
      // Find the teacher by teacherId to get the department
      const teacher = await teacherdb.findOne({ teacherId: project.teacherId });
      if (teacher) {
        const department = teacher.department;
        if (departmentCounts.has(department)) {
          departmentCounts.set(department, departmentCounts.get(department) + 1);
        } else {
          departmentCounts.set(department, 1);
        }
      }
    }

    // Convert map to array of objects for easier manipulation in frontend
    const data = Array.from(departmentCounts, ([department, count]) => ({ department, count }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching projects per department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAvgRequestsPerDepartment = async (req, res) => {
    try {
      // Fetch all requests from the database
      const allRequests = await requestsdb.find();
  
      // Calculate average number of requests per project and per status
      const departmentCounts = new Map();
      const departmentStatusCounts = new Map();
  
      for (const request of allRequests) {
        const projectId = request.projectId;
  
        // Find the project's department
        const project = await projectdb.findById(projectId);
        if (project) {
          const teacherId = project.teacherId;
  
          // Find the teacher's department
          const teacher = await teacherdb.findOne({ teacherId });
          if (teacher) {
            const department = teacher.department;
  
            // Calculate total number of requests per department
            if (departmentCounts.has(department)) {
              departmentCounts.set(department, departmentCounts.get(department) + request.requests.length);
            } else {
              departmentCounts.set(department, request.requests.length);
            }
  
            // Calculate number of requests per status per department
            request.requests.forEach(req => {
              if (departmentStatusCounts.has(department)) {
                if (departmentStatusCounts.get(department).has(req.status)) {
                  departmentStatusCounts.get(department).set(req.status, departmentStatusCounts.get(department).get(req.status) + 1);
                } else {
                  departmentStatusCounts.get(department).set(req.status, 1);
                }
              } else {
                const statusCountMap = new Map();
                statusCountMap.set(req.status, 1);
                departmentStatusCounts.set(department, statusCountMap);
              }
            });
          }
        }
      }
  
      // Calculate averages
      const averages = [];
      departmentCounts.forEach((requestCount, department) => {
        const statusCounts = departmentStatusCounts.get(department);
        const avgAccepted = statusCounts.has('approved') ? statusCounts.get('approved') / requestCount : 0;
        const avgRejected = statusCounts.has('rejected') ? statusCounts.get('rejected') / requestCount : 0;
        const avgPending = statusCounts.has('pending') ? statusCounts.get('pending') / requestCount : 0;
        averages.push({ department, avgRequests: requestCount, avgAccepted, avgRejected, avgPending });
      });
  
      res.status(200).json(averages);
    } catch (error) {
      console.error("Error calculating average requests per department:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// Endpoint to get the count of projects for each project type
exports.getProjectTypeCounts = async (req, res) => {
  try {
    // Fetch all projects from the database
    const projects = await projectdb.find();

    // Calculate count of projects for each project type
    const projectTypeCounts = {
      LOP: 0,
      DOP: 0,
      SOP: 0
    };

    for (const project of projects) {
      const projectType = project.project_type;
      if (projectTypeCounts.hasOwnProperty(projectType)) {
        projectTypeCounts[projectType]++;
      }
    }

    res.status(200).json(projectTypeCounts);
  } catch (error) {
    console.error("Error fetching project type counts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProjectTypeCountsByDepartment = async (req, res) => {
  try {
    // Fetch all projects from the database
    const projects = await projectdb.find();

    // Create a map to store project type counts for each department
    const departmentProjectTypeCounts = new Map();

    // Initialize project type counts for each department
    const departments = ["BIO", "CHE", "CHEM", "CE", "CS", "ECON", "EEE", "HSS", "MATH", "ME", "PHA", "PHY"];
    departments.forEach(department => {
      departmentProjectTypeCounts.set(department, { LOP: 0, SOP: 0, DOP: 0 });
    });

    // Count projects for each project type in each department
    for (const project of projects) {
      const projectType = project.project_type;
      const teacherId = project.teacherId;

      // Find the teacher's department
      const teacher = await teacherdb.findOne({ teacherId });
      if (teacher) {
        const department = teacher.department;
        if (departmentProjectTypeCounts.has(department)) {
          const counts = departmentProjectTypeCounts.get(department);
          counts[projectType]++;
          departmentProjectTypeCounts.set(department, counts);
        }
      }
    }

    res.status(200).json(Array.from(departmentProjectTypeCounts));
  } catch (error) {
    console.error("Error fetching project type counts by department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Endpoint to get total slots and filled slots for each department
exports.getSlotCountsByDepartment = async (req, res) => {
  try {
    // Fetch all projects from the database
    const projects = await projectdb.find();

    // Create a map to store total slots and filled slots for each department
    const slotCountsByDepartment = new Map();

    // Iterate over each project to get department and slot counts
    for (const project of projects) {
      const teacherId = project.teacherId;

      // Find the teacher's department
      const teacher = await teacherdb.findOne({ teacherId });
      if (teacher) {
        const department = teacher.department;
        const totalSlots = parseInt(project.project_slots);
        const filledSlots = parseInt(project.filled_slots);

        if (slotCountsByDepartment.has(department)) {
          const currentCounts = slotCountsByDepartment.get(department);
          currentCounts.totalSlots += totalSlots;
          currentCounts.filledSlots += filledSlots;
          slotCountsByDepartment.set(department, currentCounts);
        } else {
          slotCountsByDepartment.set(department, { totalSlots, filledSlots });
        }
      }
    }

    // Convert map to array of objects
    const slotCountsArray = Array.from(slotCountsByDepartment, ([department, counts]) => ({
      department,
      totalSlots: counts.totalSlots,
      filledSlots: counts.filledSlots
    }));

    res.status(200).json(slotCountsArray);
  } catch (error) {
    console.error("Error fetching slot counts by department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};