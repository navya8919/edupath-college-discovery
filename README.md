# 🎓 EduPath — College Discovery Platform

A **production-grade MVP** for college discovery and decision-making, built as part of Track B — Product Execution.

---

## 🚀 Features Built

| # | Feature | Status |
|---|---------|--------|
| 1 | 🔍 **College Listing + Search** | ✅ Done |
| 2 | 🏫 **College Detail Page** | ✅ Done |
| 3 | ⚖️ **Compare Colleges** | ✅ Done |
| 4 | 🧠 **Rank Predictor Tool** | ✅ Done |
| 5 | 💬 **Q&A / Discussion** | ✅ Done |
| 6 | 🔐 **Auth + Saved Items** | ✅ Done |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL (via `pg` pool) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Deployment** | Render.com (backend + DB) + Vercel (frontend) |

---

## 📁 Project Structure

```
edupath-college-discovery/
├── backend/
│   ├── src/
│   │   ├── db.ts              # PostgreSQL pool
│   │   ├── setup.ts           # DB schema (CREATE TABLE IF NOT EXISTS)
│   │   ├── seed.ts            # 20 colleges seed data
│   │   ├── index.ts           # Express app entry
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT middleware
│   │   └── routes/
│   │       ├── auth.ts        # /api/auth (register, login, me)
│   │       ├── colleges.ts    # /api/colleges (list, search, filter, compare, detail)
│   │       ├── predictor.ts   # /api/predictor (rank-based college suggestions)
│   │       ├── questions.ts   # /api/questions (Q&A)
│   │       └── user.ts        # /api/user (saved colleges & comparisons)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Home page
│       │   ├── colleges/page.tsx    # College listing + search + filters
│       │   ├── colleges/[id]/page.tsx # College detail
│       │   ├── compare/page.tsx     # College comparison table
│       │   ├── predictor/page.tsx   # Rank predictor
│       │   ├── discuss/page.tsx     # Q&A listing
│       │   ├── discuss/[id]/page.tsx # Q&A detail + answers
│       │   ├── saved/page.tsx       # Saved colleges
│       │   ├── profile/page.tsx     # User profile
│       │   └── auth/
│       │       ├── login/page.tsx
│       │       └── register/page.tsx
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── CollegeCard.tsx
│       │   └── CompareBar.tsx
│       └── context/
│           ├── AuthContext.tsx
│           └── CompareContext.tsx
├── render.yaml                # Render.com deployment config
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/colleges` | List colleges (search, filter, paginate) |
| GET | `/api/colleges/states` | All distinct states |
| GET | `/api/colleges/compare?ids=a,b,c` | Compare 2–3 colleges |
| GET | `/api/colleges/:id` | College detail |
| POST | `/api/colleges/:id/save` | Save college (auth) |
| DELETE | `/api/colleges/:id/save` | Unsave college (auth) |
| GET | `/api/predictor?exam=JEE+Advanced&rank=5000` | Predict colleges by rank |
| GET | `/api/questions` | List Q&A |
| POST | `/api/questions` | Ask a question (auth) |
| GET | `/api/questions/:id` | Question detail + answers |
| POST | `/api/questions/:id/answers` | Post answer (auth) |
| GET | `/api/user/saved` | Get saved colleges (auth) |
| POST | `/api/user/comparisons` | Save comparison (auth) |
| GET | `/api/user/comparisons` | Get saved comparisons (auth) |

---

## 🗄️ Database Schema

- `users` — UUID PK, email, password_hash, name
- `colleges` — 20 seeded real Indian colleges with fees, ratings, courses (JSONB), placement data
- `saved_colleges` — user ↔ college many-to-many
- `saved_comparisons` — stored comparison sets (JSONB array of college IDs)
- `questions` — forum questions linked to users + optional college
- `answers` — answers to questions

---

## 🧠 Predictor Logic

Rule-based rank-to-college mapping:

| Exam | Rank Range | Max NIRF Rank Eligible |
|------|-----------|----------------------|
| JEE Advanced | ≤ 500 | Top 2 (IITs only) |
| JEE Advanced | ≤ 5000 | Top 7 |
| JEE Main | ≤ 10,000 | Top 10 (Govt preferred) |
| NEET | ≤ 5000 | Top 8 |
| CAT | ≤ 200 | Top 5 |
| GATE | ≤ 1000 | Top 8 (Govt preferred) |

Category-based rank boosts applied: OBC-NCL (30%), SC (60%), ST (70%), EWS (20%)

---

## ⚙️ Setup Locally

### Backend
```bash
cd backend
cp .env.example .env        # Set DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@host:5432/edupath
JWT_SECRET=your_secret_key
PORT=4000
NODE_ENV=development
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 👩‍💻 Author

Built by **Navya Sree** — Full Stack Internship Track B  
GitHub: [@navya8919](https://github.com/navya8919)
