One a Day
A full-stack application for creating and managing resumes, powered by a React + Vite + ui frontend and a Python (FastAPI) backend.

🚀 Features
Frontend: React, Vite, TypeScript, ui components
Backend: Python FastAPI API for data handling
Export to PDF functionality
Clean UI & responsive design

📂 Project Structure
one_a_day/ 
│ ── Backend/ # FastAPI backend code

  ── frontend/ # React + Vite frontend

  ── requirements.txt # Python backend dependencies 

  ── package.json # Root package (if needed) 
  
  ── .gitignore # Ignored files

🛠 Setup Instructions

1️⃣ Backend Setup (FastAPI)

cd Backend python -m venv 

.venv source .venv/bin/activate

# On Windows: 

.venv\Scripts\activate 

pip install -r requirements.txt 

cd .\backend

python app.py

2️⃣ Frontend Setup (React + Vite)


cd frontend

npm install npm run dev
