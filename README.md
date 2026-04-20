# 🧠 MindLedger
 
### Mental Wellness & Personal Finance Tracker
 
> *Understand the connection between how you feel and how you spend.*
 
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
 
---
 
## 📌 Problem Statement
 
Most budgeting apps ignore emotional context, and most wellness apps ignore financial stress — yet the two are deeply linked. MindLedger bridges this gap by letting users log daily mood and energy check-ins alongside their expenses, then surfaces behavioral insights like *"You tend to impulse-spend on low-mood days."*
 
**Who is the user?** Working adults and college students who struggle with financial discipline and emotional awareness.
 
**Why does it matter?** Financial stress is one of the leading causes of anxiety. By making the connection visible, users can make more intentional decisions about both their mental health and their money.
 
---
 
## ✨ Features
 
### 🔐 Authentication
- Email & password sign up / log in via Firebase Auth
- Persistent login session — stays logged in after refresh
- Protected routes — unauthenticated users redirected to login
- Secure per-user data isolation in Firestore
### 🏠 Dashboard
- At-a-glance summary of today's mood, recent expenses, and weekly streak
- Quick-access cards for all core features
- Real-time data from Firestore — no manual refresh needed
### 😊 Daily Mood Check-In
- Log mood (1–5 scale) and energy level once per day
- Optional journal note for context
- Data stored per user per day in Firestore
- Re-submitting the same day updates the existing record
### 💸 Expense Tracker
- Add, edit, and delete expenses with full CRUD
- Fields: amount, category (Food, Entertainment, Impulse, Bills, etc.), date, note
- All expenses persist in Firestore and survive page refresh
- Category-based filtering and empty state handling
### 📅 Weekly Planner
- **Recurring tasks** — add once, appear automatically every week on assigned days
- **One-off tasks** — specific to a single week only
- Mon–Sun column view on desktop, scrollable tabs on mobile
- Week navigation: Previous / Current / Next week
- Recurring tasks carry forward indefinitely until manually deleted
- Per-week completion state — checking off this week does not affect other weeks
- Real-time Firestore sync via `onSnapshot` listeners
### 🔥 Streak Tracking
- Streak counter per recurring task (consecutive weeks fully completed)
- Flame badge displayed next to task name (e.g. 🔥 4)
- Streak resets if a week is missed
- Best streak record tracked per task
### 📊 Insights & Charts
- **Mood vs Spending** — dual-axis line chart correlating daily mood score with spending amount
- **Weekly Completion Bar Chart** — % of tasks completed per day of the week
- **4-Week Trend Line** — task completion rate over the past month
- **Streak Leaderboard** — recurring tasks ranked by current streak
- All charts built with Recharts, fully responsive, dark mode aware
### 🌙 Dark Mode
- Full dark mode support via Tailwind `darkMode: 'class'`
- Toggle with sun/moon icon in the navbar
- Preference persisted in `localStorage`
- Every component, card, input, and modal styled for both modes
### 📱 Responsive Design
- Mobile-first layout
- Collapsible sidebar (icon-only on desktop, drawer on mobile)
- Sidebar open/closed state persisted in `localStorage`
- Touch-friendly targets (minimum 44px)
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State Management | Context API (`AppContext`, `DataContext`) |
| Backend | Firebase Auth + Firestore |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel / Netlify |
 
---
 
## ⚛️ React Concepts Demonstrated
 
### Core
- Functional components throughout
- `useState` for all local UI state
- `useEffect` for Firestore listeners and data fetching
- Conditional rendering (loading states, empty states, auth gates)
- Lists with stable keys
- Controlled components for all forms
### Intermediate
- Lifting state up between sibling components
- React Router v6 with protected routes
- Context API for global user and app state
### Advanced
- `useMemo` for deriving insight correlations from raw data
- `useCallback` for memoized event handlers in list components
- `useRef` for auto-focusing inputs
- `React.lazy` + `Suspense` for lazy-loading the Insights page
- Custom hooks: `useExpenses()`, `useMoodLog()`, `usePlanner()`
---
 
## 🗂️ Project Structure
 
```
src/
├── components/         # Reusable UI — MoodPicker, ExpenseCard, BudgetBar, StreakBadge
├── pages/              # Dashboard, CheckIn, Expenses, Planner, Insights, Login, Signup
├── hooks/              # useExpenses.js, useMoodLog.js, usePlanner.js
├── context/            # AppContext.jsx, DataContext.jsx
├── services/           # firebase.js, expenseService.js, moodService.js
└── utils/              # dateHelpers.js, insightCalculators.js
```
 
---
 
## 🚀 Setup Instructions
 
### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Email/Password Auth enabled
### 1. Clone the repository
```bash
git clone https://github.com/your-username/mindledger.git
cd mindledger
```
 
### 2. Install dependencies
```bash
npm install
```
 
### 3. Configure Firebase
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
 
### 4. Enable Firebase services
- Firebase Console → Authentication → Sign-in method → Enable **Email/Password**
- Firebase Console → Firestore → Rules → paste the following:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
 
### 5. Run the app
```bash
npm run dev
```
 
---
 
## 📁 Firestore Data Model
 
```
users/
  {uid}/
    checkins/
      {date}/          → mood, energy, note
    expenses/
      {id}/            → amount, category, date, note
    budgets/
      {month}/         → category → limit map
    planner/
      recurring/
        tasks/
          {taskId}/    → name, days[], category, streak, bestStreak
      weeks/
        {weekId}/
          days/
            {dayName}/
              tasks/
                {taskId}/ → name, createdAt
          completions/   → { monday: { taskId: true }, ... }
```
 
---
 
## 🎥 Demo Script
 
1. Sign up with a new account
2. Submit today's mood check-in (e.g. mood: 2, energy: 3, note: "stressed about exams")
3. Add 3 expenses including one tagged as "Impulse"
4. Open the Planner — add a recurring task "Gym" on Mon, Wed, Fri
5. Check off today's task — observe the streak counter
6. Navigate to Insights — show the mood vs spending correlation chart
7. Toggle dark mode — demonstrate full dark mode support
8. Refresh the page — show everything persists
---
 
## 👨‍💻 Author
 
Built as an end-term React project demonstrating production-level frontend development with Firebase backend integration.
 
---
 
*"This project is not just an assignment — it's a portfolio piece."*
 
