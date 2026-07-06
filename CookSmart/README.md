# 🍳 CookSmart AI

<p>
  A full-stack AI-powered cooking assistant built with the MERN stack. Generate recipes from your available ingredients, discover dishes by name, get personalised recommendations, and turn any recipe into an interactive cooking storyboard.
</p>


---

## ✨ Features

### 👤 User Features
- Secure authentication using JWT
- Profile management
- Save and manage favourite recipes
- Responsive design with Dark Mode support

### 🍽️ Recipe Features
- Browse and search recipes
- Filter recipes by cuisine and dietary preferences
- Create, edit, and delete personal recipes
- Detailed recipe pages with nutrition information

### 🤖 AI Features
- Generate recipes from available ingredients
- Generate recipes by entering a recipe name
- AI-generated food images using Pollinations AI
- Smart ingredient substitution suggestions
- Personalized recipe recommendations
- Interactive cooking storyboard with captions and autoplay slideshow

---

## 🚀 Tech Stack

| Layer     | Technology                                           |
|-----------|------------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend   | Node.js, Express, MongoDB Atlas, Mongoose            |
| Auth      | JWT (jsonwebtoken + bcryptjs)                        |
| AI        | Google Gemini 1.5 Flash                              |
| Images    | Pollinations AI (free, no API key)                   |

---
## Local Development
 
### 1. Clone the repository
 
```bash
git clone https://github.com/your-username/cooksmart.git
cd cooksmart
```
 
### 2. Backend setup
 
```bash
cd server
cp .env.example .env
# Edit .env and fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev        # starts on http://localhost:5000
```
 
### 3. Frontend setup
 
Open a second terminal:
 
```bash
cd client          # or wherever your Vite root is
cp .env.example .env.local
# VITE_API_URL is already set to http://localhost:5000/api for local dev
npm install
npm run dev        # starts on http://localhost:8080
```
 
### 4. Seed the database (optional)
 
```bash
cd server
npm run seed
```
 
This inserts a set of sample recipes with real chef names and Pollinations images.
 
---

## 🌟 Project Highlights

- Full-stack MERN application with authentication and protected routes.
- AI-powered recipe generation using Google Gemini.
- Content-based recommendation system.
- Interactive cooking storyboard feature.
- AI-generated recipe images.
- Responsive UI with dark mode support.

---



## Project Structure
 
```
cooksmart/
├── server/                  # Express backend
│   ├── config/              # DB + Gemini setup
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── scripts/             # Seed script
│   ├── .env.example
│   ├── render.yaml
│   └── index.js
│
└── client/                  # Vite + React frontend
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── contexts/        # AuthContext
    │   ├── hooks/           # useRecipes, useRecommendations, …
    │   ├── pages/           # Route-level page components
    │   ├── services/        # Axios API layer
    │   └── types/           # TypeScript interfaces
    ├── .env.example
    └── vercel.json
```
 
---
## 📚 About This Project

CookSmart AI was developed as a full-stack and AI project to explore how generative AI can make recipe discovery and cooking more interactive and personalized.

---

## 📄 License

This project is open for learning and educational purposes.