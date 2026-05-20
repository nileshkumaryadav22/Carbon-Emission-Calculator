# 🌱 EcoTrace: Carbon Emission Calculator

EcoTrace is a modern, responsive full-stack web application designed to help users measure, visualize, and reduce their carbon footprint. This project was developed as a college major project showcase, featuring high-quality design, real-time calculations, interactive charts, and gamified achievements.

---

## 🚀 Main Features

### 1. Granular Calculation Modules
Log consumption across 5 distinct categories, with instant real-time calculation changes directly on the screen:
* **Transportation**: Track distances traveled via motorbike, car (supports petrol, diesel, CNG, and electric), bus, train, and flights.
* **Electricity Usage**: Calculate energy footprint using grid kWh units, air conditioning hours, fans, and bulbs.
* **Food & Diet**: Profiles vegan, vegetarian, moderate meat, and heavy meat consumption along with dairy levels and fast food frequencies.
* **Digital Footprint**: Measure daily screen hours from mobile, laptop, HD streaming, and gaming.
* **Household Fuels**: Track LPG cylinders consumed, coal weights, and wood combustion.

### 2. Beautiful Analytics Dashboard
* **KPI Metrics**: Real-time monthly footprint totals, Environmental Scores (0-100), unlocked badges, and comparative ratios vs global levels.
* **Interactive Charts**: Rendered using Recharts:
  * Six-month historical emission trends (Area Chart).
  * Category distribution percentage breakdown (Pie Chart).
  * Grouped comparison of user current month vs user average vs global average (Bar Chart).
  * Radial score gauge assessing environmental rating.

### 3. Gamification & Leaderboard
* **Badge System**: Earn status badges like *Carbon Zero Hero*, *Eco Warrior*, *Green Commuter*, and *Climate Guardian* based on Environmental Scores.
* **Ranks list**: Compare scores on a community leaderboard.

### 4. Smart Recommendations Hub
* Adopt green habits (e.g. public commuting, AC at 24°C, Meatless Mondays, switching off stand-by plugs) to see potential CO₂ reductions and accumulate points.

### 5. Detailed Reporting & Exports
* Review historical logs table, filter entries, delete logs, export details to **CSV**, download beautifully compiled **PDF Reports**, or send report parameters via **Email**.

### 6. Floating AI EcoBot
* A floating glassmorphic AI chatbot that answers sustainability questions, suggests energy-saving ideas, and explains badge limits. Supports Gemini API key failover.

---

## 💻 Technology Stack

* **Frontend**: React (Vite.js) + Tailwind CSS v3 + Recharts + Lucide Icons + jsPDF.
* **Backend**: Node.js + Express.js + RESTful API.
* **Database**: MongoDB (Mongoose Object Modeling).
* **Security & Auth**: JWT + Password hashing via Bcryptjs.

---

## 🛠️ Folder Structure

```
├── backend/
│   ├── config/          # DB Connection
│   ├── middleware/      # JWT and Admin protections
│   ├── models/          # Mongoose Schemas (User & Record)
│   ├── routes/          # API Route endpoints (Auth, Records, Admin, Chatbot)
│   ├── utils/           # Emission factors, calculations, and seeders
│   └── server.js        # Express app entry
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Layout triggers (Sidebar, Navbar, Chatbot, Toast)
│   │   ├── context/     # AuthContext and ThemeContext
│   │   ├── pages/       # Login, Signup, Dashboard, Calculator, etc.
│   │   ├── utils/       # Axios wrappers
│   │   ├── App.jsx      # React router routes
│   │   └── main.jsx     # Mounting script
├── package.json         # Concurrent runner scripts
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed.
* [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string.

### Configuration
1. Open `backend/.env` and configure your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/eco_trace
   JWT_SECRET=super
   GEMINI_API_KEY=your_gemini_api_key_here  # Optional (falls back to local NLP bot if empty)
   ```

2. Install all dependencies for root, backend, and frontend:
   ```bash
   npm run install-all
   ```

3. Seed the database with stunning demo profiles and logs:
   ```bash
   # In the root directory
   cd backend
   npm run seed
   cd ..
   ```

4. Launch both servers in developer mode:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend: `http://localhost:5000`

---

## 💡 Demo Credentials for Grading

To test the application immediately with pre-populated graphs, leaderboard entries, and metrics, use these seeded credentials at the login screen:

### 👤 Standard User Profile
* **Email**: your's
* **Password**: your's
* *Contains: 6 months of historical footprint data, unlocked badges, and leaderboard entries.*

### 🔑 Platform Administrator
* **Email**: 
* **Password**: 
* *Contains: Full access to the Admin Dashboard (delete users, review platform metrics, category ratios).*
