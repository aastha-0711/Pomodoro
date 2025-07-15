# 🧠 Personalized Pomodoro Timer

A sleek, full-featured Pomodoro Timer app that **personalizes session durations** based on your focus history — powered by React, Tailwind CSS (via ShadCN UI), and a FastAPI + Python backend for intelligent predictions.

![Light Mode Screenshot](images/Screenshot%202025-07-15%20154318.png)

---

## 🚀 Features

- ⏱️ **Adaptive Pomodoro Timer**
  - Focus / Short Break / Long Break durations adjust based on your focus performance
- 📊 **Session History + Analytics**
  - Track focus vs. unfocused sessions
  - View detailed charts and trends
- 🎛️ **Custom Settings**
  - Auto-start options, sound effects, notification support
- 👤 **User Authentication**
  - Sign up / Log in with secure JWT authentication
- 🌗 **Light & Dark Modes**
  - Auto theme switching, customizable visuals
- 🧠 **Smart Focus Detection**
  - EEG-based focus prediction (via external FastAPI logic)

---

## 📷 Screenshots

### 🔒 Authentication
Login & Signup screens with theme support

| Login Page | Signup Page |
|------------|-------------|
| ![Login](images/Screenshot%202025-07-15%20154405.png) | ![Signup](images/Screenshot%202025-07-15%20154416.png) |

---

### 🧭 Timer Modes
| Focus Mode | Short Break | Long Break |
|------------|-------------|------------|
| ![Focus](images/Screenshot%202025-07-15%20154239.png) | ![Short Break](images/Screenshot%202025-07-15%20154247.png) | ![Long Break](images/Screenshot%202025-07-15%20154256.png) |

---

### ⚙️ Settings + Analytics
| Settings Page | Analytics View |
|---------------|----------------|
| ![Settings](images/Screenshot%202025-07-15%20154352.png) | ![Analytics](images/Screenshot%202025-07-15%20154224.png) |

---

## 🧠 FastAPI Backend for Focus Prediction

This project integrates with a separate backend for focus state prediction using EEG signals.

🔗 **Backend Repo**: [EEG Focus Logic + FastAPI API](https://github.com/aastha-0711/Pomodoro-Prediction-main)

Features:
- 🧠 EEG signal-based focus prediction
- 🧾 Session logging and analysis
- 🔐 FastAPI + Pydantic for API & validation

---

## 🛠️ Tech Stack

### Frontend
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.dev/) – modern components
- [Lucide Icons](https://lucide.dev/)

### Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- [Python](https://www.python.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [MongoDB](https://www.mongodb.com/)

---

## 📦 Setup Instructions


```bash
### Frontend
git clone https://github.com/YOUR-USERNAME/Pomodoro.git
cd Pomodoro
pnpm install
pnpm dev

###Backend
git clone https://github.com/YOUR-USERNAME/Pomodoro.git
cd Pomodoro
cd backend
pnpm install
pnpm dev

###API
Refer to the other repository mentioned above which has the python logic and API.
.\venv\Scripts\activate
uvicorn app.main:app --reload
