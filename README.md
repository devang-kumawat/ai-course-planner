 
# AI Course Scheduler

A personalized, multi-week AI-powered curriculum generator. Uses the Perplexity Sonar API to curate content and create quizzes tailored to your learning goals.

---

## Table of Contents

- [Features](#features)  
- [Demo](#demo)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Configuration](#configuration)  
  - [Running the App](#running-the-app)  
- [Fallback and Offline Demo Mode](#fallback-and-offline-demo-mode)  
- [Customization](#customization)  
- [Contributing](#contributing)  

---

## Features

- Weekly AI-generated learning plans based on topic, skill level, and time
- Curated articles and videos from trusted sources like GeeksforGeeks and YouTube
- Quizzes to see your performance per week
- Quiz caching to reduce API calls and speed up the UI
- Fallback dummy data for offline/demo use
- Modular, responsive UI with modals, spinners, and alerts
- Clean, scalable React + TypeScript codebase

---

## Demo

[Check here..](https://ai-course-planner-hdwc3tj17-devang-kumawats-projects.vercel.app/)

---

## Getting Started

### Prerequisites

- Node.js v16 or later  
- npm or yarn  
- Perplexity Sonar API key for live content

---

### Installation

```bash
git clone https://github.com/devang-kumawat/ai-course-planner.git  
cd ai-course-scheduler  
npm install
```

---

### Configuration

1. Copy `.env.example` to `.env.local`
2. Add your API key:

```env
PERPLEXITY_API_KEY=your_api_key_here
```

> Without a valid key, the app will run in **demo mode** using dummy data.

---

### Running the App

```bash
npm run dev
# or
yarn dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Fallback and Offline Demo Mode

- If no API key is provided or the Perplexity API is down, the app uses `dummy_resp.json`.
- A banner will notify users that fallback data is being used.
- The app remains fully functional in demo mode.

---

## Customization

- Modify prompts in `/api/schedule/route.ts` and `/api/quiz/route.ts` to control AI behavior.
- Edit `dummy_resp.json` to change fallback content.
- Extend or modify UI components as needed.

---

## Contributing

1. Fork the repo  
2. Create a branch:  
   `git checkout -b feature/your-feature`  
3. Make your changes  
4. Commit:  
   `git commit -m "Add feature"`  
5. Push:  
   `git push origin feature/your-feature`  
6. Open a Pull Request

---

