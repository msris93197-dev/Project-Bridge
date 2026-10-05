// Seeds demo data. Safe to re-run: it replaces everything it created before.
// Usage: npm run seed   (set DB_NAME to target a different database)
require("dotenv").config();
const mongoose = require("mongoose");
const userdb = require("../model/userSchema");
const studentdb = require("../model/studentSchema");
const teacherdb = require("../model/teacherSchema");
const projectdb = require("../model/projectSchema");
const requestsdb = require("../model/requestSchema");
const likesdb = require("../model/likesSchema");
const notificationdb = require("../model/notificationSchema");

const teachers = [
  { id: "demo-teacher", name: "Demo Teacher", dept: "CS", block: "D", room: "214" },
  { id: "seed-t1", name: "Dr. Ananya Rao", dept: "CS", block: "A", room: "305" },
  { id: "seed-t2", name: "Dr. Vikram Shah", dept: "EEE", block: "B", room: "112" },
  { id: "seed-t3", name: "Dr. Meera Nair", dept: "MATH", block: "C", room: "208" },
  { id: "seed-t4", name: "Dr. Rohit Verma", dept: "ME", block: "E", room: "021" },
];

const students = [
  { id: "demo-student", name: "Demo Student", cg: "8.7", first: "CSE" },
  { id: "seed-s1", name: "Aarav Mehta", cg: "9.2", first: "CSE" },
  { id: "seed-s2", name: "Ishita Kapoor", cg: "8.1", first: "ECE" },
  { id: "seed-s3", name: "Rahul Iyer", cg: "7.4", first: "ME" },
  { id: "seed-s4", name: "Sneha Reddy", cg: "9.6", first: "CSE" },
  { id: "seed-s5", name: "Karthik Menon", cg: "6.8", first: "CE" },
  { id: "seed-s6", name: "Priya Nambiar", cg: "8.9", first: "CSE" },
];

const projects = [
  { key: "p1", t: "demo-teacher", name: "Campus Navigation with AR", type: "DOP", domain: "Computer Vision", slots: 2, cg: 8, pre: ["Python", "Linear Algebra"], desc: "Build an augmented-reality wayfinding app for the campus using phone cameras and SLAM." },
  { key: "p2", t: "demo-teacher", name: "Anomaly Detection in Smart Grids", type: "LOP", domain: "Machine Learning", slots: 3, cg: 7, pre: ["Python", "Statistics"], desc: "Detect faults and theft patterns in smart-meter time series data." },
  { key: "p3", t: "demo-teacher", name: "Survey of Graph Neural Networks", type: "SOP", domain: "Deep Learning", slots: 1, cg: 0, pre: ["Machine Learning"], desc: "Literature study of GNN architectures and their applications." },
  { key: "p4", t: "seed-t1", name: "Secure Messaging Protocol Analysis", type: "SOP", domain: "Security", slots: 2, cg: 7, pre: ["Computer Networks", "Cryptography"], desc: "Formal analysis of an end-to-end encrypted messaging protocol." },
  { key: "p5", t: "seed-t1", name: "Distributed Key-Value Store", type: "DOP", domain: "Systems", slots: 2, cg: 8, pre: ["Operating Systems", "Go"], desc: "Design and implement a Raft-based replicated key-value store." },
  { key: "p6", t: "seed-t2", name: "Low-Power Edge Inference Board", type: "LOP", domain: "Embedded", slots: 2, cg: 7, pre: ["Digital Design", "C"], desc: "Prototype a microcontroller board for on-device keyword spotting." },
  { key: "p7", t: "seed-t2", name: "Wireless Power Transfer", type: "DOP", domain: "Power Electronics", slots: 1, cg: 8, pre: ["Circuits"], desc: "Design a resonant inductive charging system." },
  { key: "p8", t: "seed-t3", name: "Numerical Methods for PDEs", type: "SOP", domain: "Applied Math", slots: 3, cg: 6, pre: ["Calculus", "Python"], desc: "Compare finite-difference and finite-element solvers on benchmark problems." },
  { key: "p9", t: "seed-t3", name: "Optimization for Supply Chains", type: "LOP", domain: "Operations Research", slots: 2, cg: 0, pre: ["Linear Algebra"], desc: "Model and solve a vehicle-routing problem with real constraints." },
  { key: "p10", t: "seed-t4", name: "Quadcopter Flight Controller", type: "DOP", domain: "Robotics", slots: 2, cg: 7, pre: ["Control Systems", "C++"], desc: "Develop and tune a PID flight controller in simulation, then on hardware." },
];

// [project key, student id, status, reason]
const requests = [
  ["p1", "seed-s1", "approved", "I have built SLAM prototypes and want to take it to a real campus app."],
  ["p1", "seed-s4", "pending", "Computer vision is my main interest and I have a strong math background."],
  ["p1", "seed-s2", "rejected", "I would like to learn AR development."],
  ["p2", "seed-s6", "approved", "Time-series anomaly detection fits my earlier internship work."],
  ["p2", "seed-s1", "pending", "I would like to extend my ML coursework with a real dataset."],
  ["p2", "seed-s3", "pending", "Interested in applying ML to the energy sector."],
  ["p3", "seed-s4", "pending", "I am preparing for a research career in graph learning."],
  ["p4", "demo-student", "pending", "Security is the area I want to specialise in."],
  ["p5", "seed-s6", "pending", "I enjoyed the distributed systems course and want hands-on practice."],
  ["p8", "demo-student", "rejected", "I like numerical computing."],
  ["p9", "seed-s5", "approved", "Operations research is relevant to my civil engineering thesis."],
];

(async () => {
  await mongoose.connect(process.env.DATABASE, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});
  const isSeed = (field) => ({ [field]: { $regex: "^(demo|seed)-" } });

  const old = await projectdb.find(isSeed("teacherId"));
  await requestsdb.deleteMany({ projectId: { $in: old.map((p) => String(p._id)) } });
  await Promise.all([
    projectdb.deleteMany(isSeed("teacherId")),
    teacherdb.deleteMany(isSeed("teacherId")),
    studentdb.deleteMany(isSeed("studentId")),
    likesdb.deleteMany(isSeed("studentId")),
    userdb.deleteMany(isSeed("googleId")),
    notificationdb.deleteMany(isSeed("userId")),
  ]);

  const users = [
    ...teachers.map((t) => ({ googleId: t.id, displayName: t.name, email: `${t.id}@projectbridge.demo`, user_type: "teacher" })),
    ...students.map((s) => ({ googleId: s.id, displayName: s.name, email: `${s.id}@projectbridge.demo`, user_type: "student" })),
    { googleId: "demo-admin", displayName: "Demo Admin", email: "demo-admin@projectbridge.demo", user_type: "admin" },
  ];
  await userdb.insertMany(users);
  await teacherdb.insertMany(teachers.map((t) => ({ teacherId: t.id, name: t.name, block: t.block, roomNumber: t.room, department: t.dept })));
  await studentdb.insertMany(
    students.map((s, i) => ({
      studentId: s.id, name: s.name, idNumber: `2021A7PS${1000 + i}H`, degree: "Single Degree",
      firstDegree: s.first, secondDegree: "", cg: s.cg, drafts: [],
    }))
  );
  await likesdb.insertMany(students.map((s) => ({ studentId: s.id, likedProjects: [] })));

  const created = {};
  for (const p of projects) {
    created[p.key] = await projectdb.create({
      teacherId: p.t, project_name: p.name, project_type: p.type, project_domain: p.domain,
      project_description: p.desc, project_slots: p.slots, filled_slots: 0, cg_cutoff: p.cg,
      pre_requisites: p.pre, finalized_students: [],
    });
  }

  const byProject = {};
  for (const [key, studentId, status, reason] of requests) {
    const project = created[key];
    (byProject[key] = byProject[key] || []).push({
      studentId, status, reason_to_do_project: reason, pre_requisites_fullfilled: project.pre_requisites.slice(0, 1),
    });
    if (status === "approved") {
      project.filled_slots += 1;
      project.finalized_students.push(studentId);
      await project.save();
    }
  }
  for (const [key, list] of Object.entries(byProject)) {
    await requestsdb.create({ projectId: String(created[key]._id), requests: list });
  }

  await notificationdb.insertMany([
    { userId: "demo-teacher", message: "Sneha Reddy applied to \"Campus Navigation with AR\".", link: "/teachers/RequestsPage/demo-teacher" },
    { userId: "demo-teacher", message: "Rahul Iyer applied to \"Anomaly Detection in Smart Grids\".", link: "/teachers/RequestsPage/demo-teacher" },
    { userId: "demo-student", message: "Your request for \"Numerical Methods for PDEs\" was rejected.", link: "/students/StudentHome/demo-student" },
  ]);

  console.log(`Seeded ${teachers.length} teachers, ${students.length} students, ${projects.length} projects, ${requests.length} requests.`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
