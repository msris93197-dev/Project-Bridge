const userdb = require("../model/userSchema");

exports.getUserData = async (req, res) => {
    // Logic for saving project
    try {
        const userId = req.params.userId;
        const user = await userdb.findOne({ googleId: userId });
    
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }
    
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
};
