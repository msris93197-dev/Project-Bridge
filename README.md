# Project Bridge

Project Bridge is a web application built using MERN stack, designed to automate and streamline the process of applying for project-type courses. This system addresses several challenges faced by students and professors in the current manual process, making it more efficient and transparent for all parties involved.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Tech Stack](#tech-stack)
- [Web Application Functionalities](#web-application-functionalities)
  - [User Login](#user-login)
  - [Professor Side Functionalities](#professor-side-functionalities)
  - [Student Side Functionalities](#student-side-functionalities)
  - [Admin Functionalities](#admin-functionalities)
- [Live Demo](#live-demo)
- [What is in this version](#what-is-in-this-version)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Tests](#tests)
- [Credits](#credits)

## Problem Statement

Students willing to apply for formal projects face numerous challenges in the current system:

1. **Communication Hurdles**: Students need to email teachers individually to request projects, leading to inefficiency and time consumption.
2. **Lack of Response**: Students may or may not receive replies to their project requests, causing uncertainty.
3. **Limited Information**: Students are unaware of teachers with available project slots, limiting their options.
4. **Teacher’s Work Overload**: Teachers receive a flood of emails, making it difficult to assess student qualifications and manage project requests effectively.
5. **Information Gap**: Students lack crucial details like teacher room numbers and availability timings, complicating in-person meetings.

## Solution Overview

To address these challenges, we propose the development of "Project Bridge," an application system designed to automate and streamline the process of applying for project-type courses. The aim is to provide a more efficient and transparent experience for both students and professors.


## Tech Stack

`MERN`, `FIREBASE`

1. Database: `MongoDB`
2. Backend: `Express.js`, `Node.js`
3. Frontend: `React.js`
4. Login: `Google Auth(Firebase)`
5. File Storage: `Google Cloud Storage`
 
 
## Web Application Functionalities

The web application supports three types of users: Professor, Student, and Admin.
<details>
<summary><b><a name="user-login"></a>User Login</b></summary>
  <br>
  
- Google Firebase Authentication is used so that users can directly login via their BITS google accounts. 

   ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/cd6aa7d8-8c3f-4795-81bd-0ca5b720e060)

</details>
<details>
<summary><b><a name="professor-side-functionalities"></a>Professor Side Functionalities</b></summary>
<br>
  
1. **Login**: Professors log in using their BITS Google account.
  
2. **Home Page**: Professors can create new projects (name, description, number of slots, project type, pre-requisites). They can edit or delete projects, with changes reflected instantly on the webpage.

   ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/dfe3850f-e561-4b8c-aa84-9e98cbc526df)
   
   ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/09f1c6e7-660e-4b8e-a630-94d3046f273b)

4. **Requests Page**: Professors can view all student requests for their projects in a tabular format. Information includes CG eligibility, degree, resume, performance sheet, pre-requisites fulfilled, and a short paragraph written by the student. Professors can accept or reject requests and undo decisions if necessary.
   
   ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/9fda15fc-db10-4f4d-b165-4e108702b8b1)

5. **Profile Page**: Professors can fill out their basic details, such as name, department, room number, and block/building.

   ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/1fcaece9-cd99-44b0-9c44-0b4a63154862)

</details>
<details>
<summary><b><a name="student-side-functionalities"></a>Student Side Functionalities</b></summary>
<br>
  
1. **Login**: Students log in using their BITS Google account.
   
2. **Home Page**: Displays the status of current requests sent by the students (accepted/rejected/pending).
   
   ![student_home](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/5230fcc5-4010-4aa7-8934-227de0eb7d5e)
   
3. **Project Bank**: Lists all projects by every teacher and department. Students can view project details, apply for projects, save drafts, like projects, and filter projects by various criteria. Requests are sent without the need to reload the page.
   
   ![student_projectbank](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/dfee28b1-262a-442a-ac28-0ff2aa0f7cb2)
   
4. **Profile Page**: Students can fill in their basic information (ID number, branch, current CGPA) and upload their resume and performance sheet.
   
   ![student_profile](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/18cb979d-d133-410d-a989-f3f05b3b6d67)

</details>
<details>
<summary><b><a name="admin-functionalities"></a>Admin Functionalities</b></summary>
<br>
 
- Admins can view various statistics related to projects and requests, such as projects per department, average requests per department, project slots with respect to departments, and project type distribution, displayed in graphs (line, bar, pie chart, etc.).
  
  ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/0d34b5cd-3776-4e06-9336-bd569d8b71ad)
  
  ![image](https://github.com/Hrishi2705/Project-Bridge/assets/134578117/7d9c8836-ee22-4e3b-bd59-ca8da60e44b7)

</details>


## Live Demo

**Live app:** _add your deployed URL here_ — use the **Try a demo** tiles on the login page to explore each role with sample data (no Google account needed).

## What is in this version

Beyond the original MERN prototype, this version adds:

- **Correct request workflow** — approving a request now claims a slot atomically (two simultaneous approvals can never overfill a project), rejecting/reverting frees it, and a student can be approved on only one project.
- **Server-side eligibility checks** — CG cutoff, open slots, valid prerequisites and duplicate requests are enforced by the API, not just the UI.
- **Request lifecycle** — `pending → approved / rejected`, plus student withdrawal and re-application.
- **Authentication and authorization** — every route requires a session; users can only touch their own data, teachers only their own projects, and admin/teacher/student routes are role-gated.
- **Security hardening** — `helmet`, rate limiting, NoSQL-injection sanitising, input validation, Mongo-backed sessions, secure cross-site cookies in production.
- **In-app notifications** for new and updated requests.
- **Demo mode and seed data** — one-click demo accounts and a seed script with sample projects and requests.
- **Tests and CI** — API integration tests (`npm test` in `server/`) run in GitHub Actions together with a client build.
- **Redesigned UI** — shared theme, responsive layout, loading/empty/error states, redesigned login, profile and requests pages.

## Installation and Setup

Requirements: Node.js 20+, a MongoDB database (Atlas free tier works), a Google OAuth client and a Firebase project (for file storage).

```bash
git clone https://github.com/msris93197-dev/Project-Bridge.git
cd Project-Bridge

# backend
cd server
cp .env.example .env      # fill in the values
npm install
npm run seed              # optional: sample data for the demo accounts
npm start                 # http://localhost:8000 (set PORT to change)

# frontend (second terminal)
cd client
cp .env.example .env      # fill in the Firebase values and API URL
npm install
npm start                 # http://localhost:3000
```

### Server environment (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE` | MongoDB connection string |
| `CLIENT_ID`, `CLIENT_SECRET` | Google OAuth web client |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `PORT`, `CLIENT_URL`, `SERVER_URL` | Ports and public URLs (used for CORS, redirects, OAuth callback) |
| `ADMIN_EMAILS` | Comma-separated emails that get the admin role |
| `DEMO_MODE` | `true` enables demo accounts and lets any Google user pick a role |

In Google Cloud Console, add `SERVER_URL/auth/google/callback` as an authorized redirect URI and `CLIENT_URL` as an authorized JavaScript origin.

### Client environment (`client/.env`)

`REACT_APP_API_URL`, `REACT_APP_DEMO_MODE` and the `REACT_APP_FIREBASE_*` values from your Firebase web app config.

### Deployment

- **Database:** MongoDB Atlas.
- **Backend:** any Node host (e.g. Render). Set `NODE_ENV=production`, the variables above, and use `npm start`.
- **Frontend:** a static host (e.g. Vercel). Build with `npm run build`, set `REACT_APP_API_URL` to the backend URL and rewrite all routes to `index.html`.

> `DEMO_MODE=true` intentionally lets any signed-in user choose any role. Keep it off for a real BITS deployment.

## Usage

**Professor:** Log in, create and manage projects, review and decide on student requests, update profile details.
**Student:** Log in, browse and filter the project bank, apply (or withdraw), track request status, update profile and documents.
**Admin:** View project and request statistics.

## Tests

```bash
cd server
DATABASE=mongodb://localhost:27017 npm test
```

The tests use their own `pb_test` database and drop it afterwards.

## Credits

Originally built as a team project with [@Hrishi2705](https://github.com/Hrishi2705). This repository continues that work.
