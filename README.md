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
- [Installation and Setup](#installation-and-setup)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Contributing](#contributing)

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


## Installation and Setup

1. Clone the repository
2. Navigate to the project directory
3. Install the necessary dependencies
4. Set up the environment variables (for Google Login Auth and Mongo DataBase)
5. Start the application: `npm start`
   
## Usage

**Professor:** Log in, create and manage projects, view and manage student requests, and update profile details.
**Student:** Log in, view current requests, explore available projects, apply for projects, and update profile details.
**Admin:** View project and request statistics.


## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new Pull Request.
