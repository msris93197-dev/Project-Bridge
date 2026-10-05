const projectdb = require("../model/projectSchema");

const userId = (req) => req.user && req.user.googleId;

exports.requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!roles.includes(req.session && req.session.role)) {
    return res.status(403).json({ message: "Forbidden for your role" });
  }
  next();
};

// The :param in the URL must be the signed-in user's own id.
exports.ownerOnly = (param) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.params[param] !== userId(req)) {
    return res.status(403).json({ message: "You can only access your own data" });
  }
  next();
};

// The project in :projectId must belong to the signed-in teacher.
exports.ownsProject = async (req, res, next) => {
  try {
    const project = await projectdb.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.teacherId !== userId(req)) {
      return res.status(403).json({ message: "You do not own this project" });
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid project id" });
  }
};
