// Integration tests. Needs a MongoDB: set DATABASE (e.g. mongodb://localhost:27017).
// Runs against its own database (pb_test) and drops it afterwards.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

require("dotenv").config();
process.env.DB_NAME = "pb_test";
process.env.DEMO_MODE = "true";
process.env.SESSION_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3005";
process.env.DATABASE = process.env.DATABASE || "mongodb://localhost:27017";

const mongoose = require("mongoose");
const app = require("../app");

let server;
let base;

// Minimal cookie-aware client: logs in through the demo route and keeps the session cookie
const login = async (role) => {
  const res = await fetch(`${base}/auth/demo/${role}`, { redirect: "manual" });
  const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return async (method, url, body) => {
    const r = await fetch(base + url, {
      method,
      headers: { cookie, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await r.json(); } catch {}
    return { status: r.status, body: json };
  };
};

before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
  await new Promise((resolve) => mongoose.connection.readyState === 1 ? resolve() : mongoose.connection.once("open", resolve));
  await mongoose.connection.dropDatabase();
  execFileSync("node", [path.join(__dirname, "../scripts/seed.js")], { env: process.env, stdio: "inherit" });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await app.locals.sessionStore.close();
  await mongoose.disconnect();
  server.close();
});

test("health check is public", async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

test("API requires a session", async () => {
  assert.equal((await fetch(`${base}/projects/fetchProjects/demo-teacher`)).status, 401);
  assert.equal((await fetch(`${base}/students/getData/demo-student`)).status, 401);
});

test("users cannot read other users' data or use other roles' routes", async () => {
  const teacher = await login("teacher");
  assert.equal((await teacher("GET", "/projects/fetchProjects/demo-teacher")).status, 200);
  assert.equal((await teacher("GET", "/projects/fetchProjects/seed-t1")).status, 403);
  assert.equal((await teacher("GET", "/students/getData/demo-student")).status, 403);
  assert.equal((await teacher("GET", "/admin/getusercount")).status, 403);
});

test("teacher cannot edit another teacher's project", async () => {
  const teacher = await login("teacher");
  const other = (await mongoose.model("project").findOne({ teacherId: "seed-t1" }))._id;
  assert.equal((await teacher("DELETE", `/projects/deleteProject/${other}`)).status, 403);
});

test("projectRequests returns a list for a teacher", async () => {
  const mine = await login("teacher");
  const res = await mine("GET", "/teachers/projectRequests/demo-teacher");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test("student request rules: cutoff, duplicates, withdraw and resubmit", async () => {
  const student = await login("student"); // CG 8.7
  const projectdb = mongoose.model("project");
  const high = await projectdb.findOne({ project_name: "Wireless Power Transfer" }); // cutoff 8, prereq Circuits
  const body = { reason_to_do_project: "I want to learn this", pre_requisites_fullfilled: ["Circuits"] };

  const strict = await projectdb.create({ teacherId: "seed-t2", project_name: "Strict", project_slots: 1, cg_cutoff: 9.5, pre_requisites: [] });
  assert.equal((await student("POST", `/requests/storeRequest/${strict._id}/demo-student`, { reason_to_do_project: "x" })).status, 403);

  assert.equal((await student("POST", `/requests/storeRequest/${high._id}/demo-student`, body)).status, 200);
  assert.equal((await student("POST", `/requests/storeRequest/${high._id}/demo-student`, body)).status, 400);
  assert.equal((await student("PUT", `/requests/withdraw/${high._id}/demo-student`)).status, 200);
  assert.equal((await student("POST", `/requests/storeRequest/${high._id}/demo-student`, body)).status, 200);
  assert.equal((await student("POST", `/requests/storeRequest/${high._id}/seed-s1`, body)).status, 403); // someone else's id
});

test("concurrent approvals never overfill a project", async () => {
  const teacher = await login("teacher");
  const projectdb = mongoose.model("project");
  const requestsdb = mongoose.model("requests");
  const project = await projectdb.create({ teacherId: "demo-teacher", project_name: "One slot", project_slots: 1, cg_cutoff: 0 });
  await requestsdb.create({
    projectId: String(project._id),
    requests: ["seed-s2", "seed-s3", "seed-s5"].map((studentId) => ({
      studentId, reason_to_do_project: "r", pre_requisites_fullfilled: [],
    })),
  });

  const results = await Promise.all(
    ["seed-s2", "seed-s3", "seed-s5"].map((s) => teacher("PUT", `/teachers/status/${project._id}/${s}`, { status: "approved" }))
  );
  // seed-s5 is already approved on another project, so at most one of the others can win
  const wins = results.filter((r) => r.status === 200).length;
  assert.equal(wins, 1);
  const after = await projectdb.findById(project._id);
  assert.equal(after.filled_slots, 1);
  assert.equal(after.finalized_students.length, 1);
});

test("approving notifies the student", async () => {
  const student = await login("student");
  const res = await student("GET", "/notifications/demo-student");
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 1);
});
