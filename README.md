AI-Interview-Strategist
Live Demo : https://ai-interview-strategist.vercel.app/

Project Banner:

An intelligent, full-stack web application designed to help candidates prepare for technical and behavioral interviews. By leveraging the Google Gemini API, the application analyzes resumes, identifies skill gaps, and dynamically generates tailored interview questions. It also features a seamless PDF report generation tool for offline preparation.

Core Features
Resume Analysis Engine: Parses user data to evaluate current skill sets and optimal role matching.

Generative AI Integration: Dynamically creates context-aware interview questions and strategic roadmaps using Zod schema validation.

Serverless PDF Export: Utilizes headless Chromium to generate fast, downloadable interview strategy reports directly from the cloud.

Secure Architecture: Implements a robust JWT-based authentication system with encrypted passwords for safe user onboarding.

[Dashboard Preview]:
 
<img width="2940" height="1912" alt="BCEEF83F-F723-414F-BD9A-196D11A0C961" src="https://github.com/user-attachments/assets/49754c86-0cb6-4ff3-90fd-670018312964" />


Technical Questions:

<img width="2940" height="1912" alt="A01C656C-5A60-45DD-97A7-D73FEF5D4402" src="https://github.com/user-attachments/assets/46fe25cb-6762-4caf-81e6-83a438e5620f" />


Behavioral Questions:

<img width="2940" height="1912" alt="9B03993A-CFEF-44F5-8CE8-1AC088ECAE80" src="https://github.com/user-attachments/assets/c79bff49-d0d0-4448-90a3-ba9ba183f842" />


Road map:

<img width="2940" height="1912" alt="229D8FAB-782D-4CC6-ABF1-A490807CDB9B" src="https://github.com/user-attachments/assets/6c9ac6c0-fe3f-4778-80e5-1213ce336ae6" />


Register page;

<img width="2940" height="1912" alt="22DFDAC9-D1B9-416A-927B-C2D79C956417" src="https://github.com/user-attachments/assets/00c012ee-409e-41fd-9d26-4e75b3816190" />


Login page:

<img width="2940" height="1912" alt="DC093D55-4944-4B91-A70C-FDB45AE9328B" src="https://github.com/user-attachments/assets/ca139f26-c863-4b9d-96a8-dc9cedbeabdd" />


resume:

[resume_preview (4).pdf](https://github.com/user-attachments/files/31375102/resume_preview.4.pdf)




Tech Stack
Frontend Ecosystem: React.js, Vite, Tailwind CSS

Backend Architecture: Node.js, Express.js

Database Management: MongoDB Atlas (NoSQL)

Third-Party Services: Google Gemini API (AI), Puppeteer-core & Sparticuz/Chromium (PDF Generation)

Quick Start Guide
Clone this repository to your local machine.

Run npm install in both the frontend and backend directories to install dependencies.

Create a .env file in the backend root and configure your MONGO_URI, JWT_SECRET, and GEMINI_API_KEY.

Start the development servers using npm run dev and navigate to http://localhost:5173.
