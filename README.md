# ResumeLens AI

🚀 **ResumeLens AI** is an AI-powered resume analysis platform that helps job seekers evaluate their resumes against a target job description using OpenAI. It provides ATS compatibility insights, identifies skill gaps, offers actionable improvement suggestions, and includes an AI career assistant for resume optimization.

🌐 **Live Demo:**  https://resume-analyser-psi-ochre.vercel.app/

---

## ✨ Features

- 📄 Upload and analyze PDF resumes
- 🤖 AI-powered resume evaluation using OpenAI
- 📊 Resume-to-Job Description match score
- ✅ ATS compatibility analysis
- 🎯 Skill gap identification
- 💡 Personalized resume improvement suggestions
- 💬 AI Career Assistant for resume optimization and career guidance
- 📱 Responsive modern interface
- 🔒 Secure backend API with Vercel Serverless Functions
- 🔑 API keys securely stored using environment variables

---


## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Backend

- Vercel Serverless Functions
- OpenAI API

### Deployment

- Vercel

---

## 📂 Project Structure

```text
resume-lens-ai/
│
├── api/
│   ├── analyze.js
│   └── chat.js
│
├── public/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── assets/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/RashneemaAmeen/resumeAnalyser.git

cd ResumeLens-AI
```

### Install dependencies

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
OPENAI_API_KEY=your_openai_api_key
```

**Do not commit your `.env` file to GitHub.**

---

## ▶️ Running Locally

Since the application uses Vercel Serverless Functions, run:

```bash
vercel dev
```

For frontend-only development:

```bash
npm run dev
```

---

## 📦 Build

```bash
npm run build
```

---

## ☁️ Deployment

This project is designed for deployment on **Vercel**.

Required Environment Variable:

```text
OPENAI_API_KEY
```

---

## 🎯 How It Works

1. Upload a PDF resume.
2. Paste a target Job Description.
3. ResumeLens AI extracts the resume content.
4. OpenAI analyzes:
   - ATS compatibility
   - Resume-to-JD match
   - Missing skills
   - Resume strengths
   - Improvement recommendations
5. The AI Career Assistant helps further optimize the resume.

---

## 📈 Future Enhancements

- User authentication
- Resume history
- Downloadable PDF reports
- Multiple resume management
- Cover Letter Generator
- Interview Question Generator
- LinkedIn Profile Analyzer
- Support for DOCX resumes
- Multi-language support

---

## 🔒 Security

- API keys are never exposed to the frontend.
- All OpenAI requests are routed through secure Vercel Serverless Functions.
- Environment variables are used for sensitive credentials.

---
