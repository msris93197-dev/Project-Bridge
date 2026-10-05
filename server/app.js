require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth20").Strategy;

require("./db/conn");
const userdb = require("./model/userSchema");
const studentdb = require("./model/studentSchema");
const teacherdb = require("./model/teacherSchema");
const likesdb = require("./model/likesSchema");

const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const isProd = process.env.NODE_ENV === "production";
const demoMode = () => process.env.DEMO_MODE === "true";
const ROLES = ["student", "teacher", "admin"];

const app = express();
if (isProd) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, methods: "GET,POST,PUT,DELETE", credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize());
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false })
);

const sessionStore = process.env.DATABASE
  ? MongoStore.create({ mongoUrl: process.env.DATABASE, dbName: process.env.DB_NAME || undefined })
  : undefined;
app.locals.sessionStore = sessionStore;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { sameSite: isProd ? "none" : "lax", secure: isProd, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Role rules for real Google sign-ins (BITS addresses). DEMO_MODE lets anyone pick a role.
const roleForEmail = (email) => {
  if (email.includes("@hyderabad.bits-pilani.ac.in")) {
    return email.startsWith("f") ? "student" : "other";
  }
  const admins = (process.env.ADMIN_EMAILS || "shashank.sam03@gmail.com").split(",").map((e) => e.trim());
  return admins.includes(email) ? "admin" : "teacher";
};

passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await userdb.findOne({ googleId: profile.id });
        if (!user) {
          user = await userdb.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email,
            image: profile.photos[0].value,
            user_type: roleForEmail(email),
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Make sure the role-specific profile documents exist for this user
const ensureProfile = async (userId, name, role) => {
  if (role === "teacher") {
    await teacherdb.updateOne(
      { teacherId: userId },
      { $setOnInsert: { teacherId: userId, name, block: "", roomNumber: "", department: "" } },
      { upsert: true }
    );
  } else if (role === "student") {
    await studentdb.updateOne(
      { studentId: userId },
      { $setOnInsert: { studentId: userId, name, idNumber: "", degree: "", firstDegree: "", secondDegree: "", cg: "", drafts: [] } },
      { upsert: true }
    );
    await likesdb.updateOne({ studentId: userId }, { $setOnInsert: { studentId: userId, likedProjects: [] } }, { upsert: true });
  }
};

const homeFor = (role, userId) =>
  `${CLIENT_URL}/${
    role === "admin" ? "admin/AdminHome" : role === "teacher" ? "teachers/TeacherHome" : "students/StudentHome"
  }/${userId}`;

app.get("/health", (req, res) => res.json({ status: "ok" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60 });

app.get("/auth/google", authLimiter, (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"], state: req.query.user_type })(req, res, next);
});

app.get(
  "/auth/google/callback",
  authLimiter,
  (req, res, next) => {
    passport.authenticate("google", { failureRedirect: `${CLIENT_URL}/` })(req, res, next);
  },
  async (req, res) => {
    try {
      const chosen = req.query.state;
      const expectedRole = roleForEmail(req.user.email);
      const role = demoMode() && ROLES.includes(chosen) ? chosen : expectedRole;

      if (role !== chosen) return res.redirect(`${CLIENT_URL}/error`);

      req.session.role = role;
      await ensureProfile(req.user.googleId, req.user.displayName, role);
      res.redirect(homeFor(role, req.user.googleId));
    } catch (error) {
      console.error("Login callback failed:", error);
      res.redirect(`${CLIENT_URL}/error`);
    }
  }
);

// One-click demo accounts so reviewers can try every role without a Google account
app.get("/auth/demo/:role", authLimiter, async (req, res, next) => {
  const { role } = req.params;
  if (!demoMode() || !ROLES.includes(role)) return res.status(404).json({ message: "Not found" });
  try {
    const googleId = `demo-${role}`;
    const name = `Demo ${role[0].toUpperCase()}${role.slice(1)}`;
    const user = await userdb.findOneAndUpdate(
      { googleId },
      { $setOnInsert: { googleId, displayName: name, email: `${googleId}@projectbridge.demo`, image: "", user_type: role } },
      { new: true, upsert: true }
    );
    await ensureProfile(googleId, name, role);
    req.login(user, (err) => {
      if (err) return next(err);
      req.session.role = role;
      req.session.save(() => res.redirect(homeFor(role, googleId)));
    });
  } catch (error) {
    next(error);
  }
});

app.get("/login/success", (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not Authorized" });
  res.json({ message: "user Login", user: req.user, role: req.session.role });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect(`${CLIENT_URL}/`));
  });
});

app.use("/projects", require("./routes/projectRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/teachers", require("./routes/teacherRoutes"));
app.use("/students", require("./routes/studentRoutes"));
app.use("/requests", require("./routes/requestRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`server start at port no ${PORT}`));
}
