require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/conn");
const PORT = 8000;
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth20").Strategy;
const userdb = require("./model/userSchema");
const studentdb = require("./model/studentSchema");
const teacherdb = require("./model/teacherSchema");
const likesdb = require("./model/likesSchema");
const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());

// Routes
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes")

app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/requests", requestRoutes);
app.use("/admin", adminRoutes)
app.use(
  session({
    secret: "8642957315",
    resave: false,
    saveUninitialized: true,
  })
);

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy(
    {
      clientID: clientid,
      clientSecret: clientsecret,
      callbackURL: "/auth/google/callback", 
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userdb.findOne({
          googleId: profile.id,
        });

        if (!user) {
          let user_type = profile.emails[0].value.includes(
            "@hyderabad.bits-pilani.ac.in"
          )
            ? profile.emails[0].value.startsWith("f")
              ? "student"
              : "other"
            : profile.emails[0].value === "shashank.sam03@gmail.com"
              ? "admin"
              : "teacher";

          // profile.emails[0].value.startsWith('f') ? 'student' : 'teacher' : 'other'; (Actual code while deploying)
          user = new userdb({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            user_type: user_type,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/auth/google", (req, res, next) => {
  const userType = req.query.user_type;
  const authURL = `/auth/google/callback`;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: userType, 
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  async (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "http://localhost:3000/login",
    })(req, res, next);
  },
  async (req, res) => {
    const userType = req.query.state; 
    const userEmail = req.user.email;
    let expectedRole = "";

     if (userEmail.includes("@hyderabad.bits-pilani.ac.in")) {
      if (userEmail.startsWith("f")) {
        expectedRole = "student";
      } else {
        expectedRole = "other";
      }
    } else if (userEmail === "shashank.sam03@gmail.com") {
      expectedRole = "admin";
    } else {
      expectedRole = "teacher";
    }

    if (expectedRole !== userType) {
      res.redirect("http://localhost:3000/error"); // Redirect to error page if roles mismatch
      return;
    }

    if (expectedRole === "admin") {
      const userId = req.user.googleId; // Extract userId from Google account
      res.redirect(`http://localhost:3000/admin/adminHome/${userId}`);
      return;
    }

    const userId = req.user.googleId; // Extract userId from Google account
    const name = req.user.displayName;
    // Check if the user already exists in the respective collection


    let userExists = false;
    if (userType === "teacher") {
      userExists = await teacherdb.exists({ teacherId: userId });
    } else if (userType === "student") {
      userExists = await studentdb.exists({ studentId: userId });
    }

    if (!userExists) {
      // Save userId in teachers or students collection based on user_type
      if (userType === "teacher") {
        const teacher = new teacherdb({
          teacherId: userId,
          name: name,
          block: "",
          roomNumber: "", 
          department: "", 
        });
        await teacher.save();
      } else if (userType === "student") {
        const student = new studentdb({
          studentId: userId,
          name: name,
          idNumber: "", 
          degree: "",
          firstDegree: "",
          secondDegree: "",
          cg:"",
          resume:"",
          performanceSheet:"",
          drafts: [],
        });
        await student.save();
        
        const likes = new likesdb({
          studentId: userId,
          likedProjects: [], 
        });
        await likes.save();
      }
    }

    res.redirect(
      `http://localhost:3000/${
        userType === "teacher" ? "teachers/TeacherHome" : "students/StudentHome"
      }/${userId}`
    );
  }
);

app.get("/login/success", async (req, res) => {

  if (req.user) {
    res.status(200).json({
      message: "user Login",
      user: req.user,
    });
  } else {
    console.log("User not authenticated");
    res.status(400).json({
      message: "Not Authorized",
    });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("http://localhost:3000/");
  });
});


app.listen(PORT, () => {
  console.log(`server start at port no ${PORT}`);
});
