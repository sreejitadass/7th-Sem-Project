# 🌟 LearnSphere - Personalized Study Assistant

Welcome to **LearnSphere**, your all-in-one personalized study assistant! This powerful tool allows you to upload and store study documents, leverage AI to generate summaries and flashcards, integrate with Google Calendar, manage to-do lists, track personal study progress, use timers, and take notes—all tailored to enhance your learning experience.

---

## ✨ Features

- **Document Management**: Upload and store PDFs, DOCX, or TXT study documents.
- **AI-Powered Learning**: Summarize documents and generate educational flashcards using advanced AI.
- **Google Calendar Integration**: Sync your study schedule with Google Calendar.
- **To-Do List**: Organize tasks with a customizable to-do list.
- **Study Progress Tracking**: Monitor your learning progress with personalized insights.
- **Timers**: Use built-in timers to manage study sessions effectively.
- **Note-Taking**: Jot down and save notes for quick reference.

---

## 🛠 Tech Stack

- **Frontend**: React.js with CSS for a sleek, responsive UI.
- **Backend**: Node.js with Express for API handling and MongoDB for data storage.
- **AI Backend**: Python with Flask, LangChain, and Ollama (`llama3.2` model) for AI-driven features.

---

## 🚀 Installation

### Prerequisites

- **Node.js and npm** (for frontend and Node backend)
- **Python 3.13+** (for AI backend)
- **MongoDB** (install and run locally or use a cloud instance)
- **Ollama** (for running the `llama3.2` AI model)
- **Git** (optional, for cloning the repository)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LearnSphere
```

#### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### 2. Backend Setup

```bash
cd backend
npm install
nodemon server.js
```

#### 3. AI Backend Setup

```bash
cd ai-server
python -m venv venv
source venv/bin/activate
pip install flask langchain langchain-ollama faiss-cpu pypdf2
ollama pull llama3.2
python flask_server.py
```
