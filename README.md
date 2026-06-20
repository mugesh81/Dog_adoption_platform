<div align="center">

# 🐾 Paws&Hearts — Dog Adoption Platform

### *Connecting abandoned dogs with loving homes across Tamil Nadu*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> A full-stack web application that digitizes and streamlines the entire dog adoption process — from listing and browsing to interview scheduling and final approval — built with a premium dark glassmorphism UI and a robust REST API backend.

<br/>

![Platform Preview](https://img.shields.io/badge/Status-Live%20on%20Atlas-brightgreen?style=flat-square&logo=mongodb)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square&logo=github)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [User Roles & Workflow](#-user-roles--workflow)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🌟 Overview

**Paws&Hearts** addresses a critical real-world problem — the high number of abandoned dogs in Tamil Nadu that never find homes due to a fragmented, unorganized adoption process.

This platform provides:
- A **centralized marketplace** for donors and shelters to list dogs
- A **structured application flow** for adopters with transparency at every step
- A **built-in interview scheduling system** replacing unorganized WhatsApp communication
- A **role-based access system** ensuring only verified users can perform sensitive actions
- A **cloud-first architecture** with MongoDB Atlas, ready for production deployment

The project demonstrates a complete software engineering lifecycle: requirements analysis, database modeling, REST API design, frontend development, authentication/authorization, and cloud deployment readiness.

---

## 🚀 Live Demo

> **Frontend:** `http://localhost:3000`  
> **Backend API:** `http://localhost:5000/api`  
> **Health Check:** `GET /health`

| Test Account | Email | Password | Role |
|---|---|---|---|
| Donor | `donor@test.com` | `Test@1234` | Donor |
| Adopter | `adopter@test.com` | `Test@1234` | Adopter |
| Admin | `admin@test.com` | `Test@1234` | Admin |

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based stateless authentication with 30-day token expiry
- Bcrypt password hashing (salt rounds: 10)
- Role-based access control (RBAC) — 5 distinct roles
- Password reset via secure crypto token (email integration ready)
- Protected routes on both frontend and backend

### 🐕 Dog Listings
- Rich dog profiles: breed, age, gender, size, health status, vaccination, temperament
- Multi-image upload with Multer (cloud migration to Cloudinary ready)
- Geospatial location storage (GeoJSON `2dsphere` index for future map integration)
- Adoption urgency levels: Normal / High / Critical
- Training status tracking: None / Basic / Advanced
- Public browsing without login; listing requires authentication

### 📋 Adoption Workflow
- Structured application form: reason, home type, pet experience, family count
- Adopter provides direct contact (phone, WhatsApp) for post-approval communication
- Full application lifecycle: `pending → under_review → interview_scheduled → approved/rejected`
- Duplicate application prevention per dog per adopter

### 🗓️ Interview Scheduling System
- Donors propose interview date/time with venue notes
- Adopters can: **Confirm**, **Counter-propose** a different time, or **Decline & withdraw**
- Reschedule counter tracking (maximum 3 per application)
- Inline guidelines for both donor and adopter explaining each step
- Donor notified when adopter counter-proposes

### 📊 Dashboard
- Donors: See all incoming applications, manage interviews, approve/reject
- Adopters: Track all submitted applications and interview status
- Contact details (phone/WhatsApp/city) revealed to donor only after application is active
- Platform-wide stats: total dogs, adopted, available, donors, adopters

### 🎨 UI/UX Design
- **Dark glassmorphism** theme consistent across all 11 pages
- Responsive design (mobile, tablet, desktop)
- Smooth animations via Framer Motion
- Indigo → Purple → Pink gradient branding
- Premium feel with glass-panel cards, backdrop blur, and micro-interactions

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.x | React framework, SSR/SSG, routing |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | Latest | Page & component animations |
| **Lucide React** | Latest | Icon library |
| **Axios** | Latest | HTTP client with interceptors |
| **Socket.IO Client** | 4.x | Real-time communication |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18.x | JavaScript runtime |
| **Express.js** | 4.x | REST API framework |
| **TypeScript** | 6.x | Type-safe server code |
| **Mongoose** | 5.x | MongoDB ODM |
| **JSON Web Token** | 9.x | Authentication tokens |
| **Bcryptjs** | 3.x | Password hashing |
| **Multer** | 2.x | File/image uploads |
| **Zod** | 4.x | Schema validation |
| **Socket.IO** | 4.x | Real-time events |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted database (M0 free tier) |
| **GeoJSON / 2dsphere index** | Location-based dog search |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│              Next.js 16  (React + TypeScript)               │
│   Pages: Home, Browse, Dashboard, Dog Detail, Auth, Admin   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST  +  Socket.IO
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND SERVER                          │
│              Express.js  (Node.js + TypeScript)             │
│                                                             │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐             │
│  │  /auth   │  │ /dogs-v2  │  │/applications│             │
│  └──────────┘  └───────────┘  └─────────────┘             │
│                                                             │
│  Middleware: JWT Auth → RBAC → Zod Validation → Controller  │
└───────────────────────┬─────────────────────────────────────┘
                        │ Mongoose ODM
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   MONGODB ATLAS (Cloud)                     │
│                                                             │
│   Collections: users │ dogs │ adoptionapplications         │
│                notifications │ (legacy: donors, adopters)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

### User Collection
```typescript
{
  name: string,           // 2-100 characters
  email: string,          // unique, lowercase
  passwordHash: string,   // bcrypt hash
  role: 'admin' | 'donor' | 'shelter' | 'adopter' | 'vet',
  phone?: string,
  isVerified: boolean,
  resetPasswordToken?: string,
  resetPasswordExpires?: Date,
  // Shelter-specific
  shelterRegistrationNumber?: string,
  // Adopter-specific
  experience?: string,
  homeType?: 'apartment' | 'house' | 'farm'
}
```

### Dog Collection
```typescript
{
  name: string,
  age: number,            // stored in months
  breed: string,
  gender: 'Male' | 'Female',
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large',
  healthStatus: 'Healthy' | 'Minor Care Required' | 'Special Needs',
  vaccinated: boolean,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],  // GeoJSON
    address: string
  },
  media: [{ url: string, type: 'image' | 'video' }],
  listedBy: ObjectId,     // ref: User
  adopted: boolean,
  adoptedBy?: ObjectId,   // ref: User
  temperament: string[],
  trainingStatus: 'None' | 'Basic' | 'Advanced',
  adoptionUrgency: 'Normal' | 'High' | 'Critical'
}
```

### AdoptionApplication Collection
```typescript
{
  dogId: ObjectId,                  // ref: Dog
  adopterId: ObjectId,              // ref: User
  shelterOrDonorId: ObjectId,       // ref: User
  status: 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected',
  reasonForAdopting: string,
  hasOtherPets: boolean,
  familyMembersCount: number,
  agreeToHomeVisit: boolean,
  adopterPhone?: string,            // revealed to donor after active
  adopterWhatsApp?: string,
  adopterCity?: string,
  interviewDate?: Date,
  interviewStatus: 'not_scheduled' | 'proposed' | 'confirmed' | 'rescheduled' | 'cancelled',
  interviewNotes?: string,          // donor adds venue/instructions
  rescheduleCount: number           // max 3
}
// Compound unique index: { dogId, adopterId } — prevents duplicate applications
```

---

## 📡 API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create account (adopter/donor/shelter) |
| `POST` | `/login` | Public | Sign in, receive JWT token |
| `GET` | `/me` | 🔒 JWT | Get authenticated user's profile |
| `POST` | `/forgot-password` | Public | Generate password reset token |
| `POST` | `/reset-password` | Public | Set new password with token |

### Dogs — `/api/dogs-v2`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all available dogs (filterable) |
| `POST` | `/` | 🔒 Donor/Shelter | Create new dog listing |
| `GET` | `/:id` | Public | Get single dog details |
| `PUT` | `/:id` | 🔒 Owner/Admin | Update dog listing |
| `DELETE` | `/:id` | 🔒 Owner/Admin | Remove dog listing |
| `GET` | `/my/listings` | 🔒 Donor/Shelter | Get current user's listings |

### Applications — `/api/applications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Adopter | Submit adoption application |
| `GET` | `/` | 🔒 Donor/Admin | Get all incoming applications |
| `GET` | `/my` | 🔒 Adopter | Get own submitted applications |
| `PATCH` | `/:id/status` | 🔒 Donor/Admin | Approve or reject application |
| `POST` | `/:id/interview` | 🔒 Donor | Propose interview date & time |
| `POST` | `/:id/respond` | 🔒 Adopter | Confirm / Counter-propose / Decline |

### Platform — `/api`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | Public | Platform-wide statistics |
| `GET` | `/health` | Public | Server health check |

---

## 👥 User Roles & Workflow

### Complete Adoption Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: DONOR lists a dog                                      │
│          (name, breed, photos, location, health info)           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  STEP 2: ADOPTER browses → opens dog page → submits application │
│          (reason, family info, phone/WhatsApp, home type)       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  STEP 3: DONOR reviews application on dashboard                 │
│          Status: pending → under_review                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  STEP 4: DONOR schedules interview                              │
│          (picks date/time, adds location notes)                 │
│          Status: interview_scheduled                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  STEP 5: ADOPTER responds to interview proposal                 │
│          ✓ Confirm  |  🔄 Request different time  |  ✗ Decline  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  STEP 6: DONOR approves after interview                         │
│          → Adopter sees donor's contact (phone/WhatsApp)        │
│          → Dog marked as adopted in database                    │
│          Status: approved                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Role Permissions Matrix
| Action | Adopter | Donor | Shelter | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse dogs | ✅ | ✅ | ✅ | ✅ |
| Submit application | ✅ | ❌ | ❌ | ✅ |
| List a dog | ❌ | ✅ | ✅ | ✅ |
| Edit own listing | ❌ | ✅ | ✅ | ✅ |
| Edit any listing | ❌ | ❌ | ❌ | ✅ |
| Schedule interview | ❌ | ✅ | ✅ | ✅ |
| Respond to interview | ✅ | ❌ | ❌ | ✅ |
| Approve application | ❌ | ✅ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js  >= 18.x
npm      >= 9.x
MongoDB  (local) or MongoDB Atlas account
```

### 1. Clone the Repository
```bash
git clone https://github.com/mugesh81/Dog_adoption_platform.git
cd Dog_adoption_platform
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy example env file and fill in your values
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Copy example env file
cp .env.local.example .env.local
# Edit .env.local with your backend API URL
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:3000
```

### 5. (Optional) Seed Sample Data
```bash
cd backend
npm run seed    # Adds sample dogs and users to the database
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database — MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dog-adoption-platform?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# Security — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_strong_random_64_char_secret

# CORS — comma-separated allowed frontend origins
CORS_ORIGIN=http://localhost:3000

# Email (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
# Point to your backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# (Optional) Custom image domain for production
NEXT_PUBLIC_IMAGE_DOMAIN=your-backend-domain.com
```

> ⚠️ **Security Notice:** Never commit `.env` or `.env.local` files. Both are listed in `.gitignore`.

---

## 📁 Project Structure

```
dog-adoption-platform/
│
├── backend/                          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── app.ts                    # Express server, CORS, DB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Register, login, password reset
│   │   │   ├── dog.controller.ts     # CRUD for dog listings
│   │   │   ├── application.controller.ts  # Apply, interview, approve
│   │   │   └── notification.controller.ts
│   │   ├── models/
│   │   │   ├── User.ts               # Unified user model (all roles)
│   │   │   ├── Dog.ts                # Dog listing with GeoJSON
│   │   │   ├── AdoptionApplication.ts # Full application + interview state
│   │   │   └── Notification.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # /api/auth/*
│   │   │   ├── dog.routes.ts         # /api/dogs-v2/*
│   │   │   ├── application.routes.ts # /api/applications/*
│   │   │   └── notification.routes.ts
│   │   └── services/                 # Legacy V1 services (backward compat)
│   ├── tests/                        # Jest unit + integration tests
│   ├── uploads/                      # Local image storage (gitignored)
│   ├── .env.example                  # Required env vars template
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                         # Next.js 16 + TypeScript app
    ├── src/
    │   ├── pages/
    │   │   ├── index.tsx             # Home: hero, stats, dog grid
    │   │   ├── browse.tsx            # Search & filter all dogs
    │   │   ├── dog/[id].tsx          # Dog detail + application form
    │   │   ├── dashboard.tsx         # User hub: applications + interviews
    │   │   ├── my-listings.tsx       # Donor's dog management
    │   │   ├── edit-listing/[id].tsx # Edit a specific dog listing
    │   │   ├── login.tsx             # Sign in
    │   │   ├── register.tsx          # Create account
    │   │   ├── forgot-password.tsx   # Request reset link
    │   │   ├── reset-password.tsx    # Set new password
    │   │   └── admin.tsx             # Admin panel
    │   ├── components/
    │   │   ├── layout/Navbar.tsx     # Global dark navigation
    │   │   ├── common/Card.tsx       # Glassmorphism card wrapper
    │   │   ├── DogList.tsx           # Dog grid component
    │   │   ├── DonorForm.tsx         # Add dog listing form
    │   │   ├── NotificationBell.tsx  # In-app notifications
    │   │   └── chat/ChatBox.tsx      # Socket.IO real-time chat
    │   ├── context/
    │   │   └── AuthContext.tsx       # Global auth state + JWT management
    │   ├── utils/index.ts            # All API calls (axios wrappers)
    │   └── styles/globals.css        # Design tokens + utility classes
    ├── .env.local.example
    ├── next.config.js
    └── tailwind.config.js
```

---

## ☁️ Deployment

### Recommended Stack (All Free Tiers)
| Service | Purpose | Free Tier |
|---|---|---|
| **Vercel** | Frontend hosting | Unlimited static deploys |
| **Render** or **Railway** | Backend hosting | 512MB RAM, sleeps after 15 min |
| **MongoDB Atlas** | Database | 512MB storage |
| **Cloudinary** | Image storage | 25GB bandwidth |
| **Resend** | Email service | 3,000 emails/month |

### Deployment Steps

**1. Database:** Create a free MongoDB Atlas cluster → get connection string → set as `MONGODB_URI`

**2. Backend (Render):**
```bash
# Build command:
npm install && npm run build

# Start command:
npm start   # runs: node dist/src/app.js
```
Set all environment variables in Render dashboard.

**3. Frontend (Vercel):**
- Connect GitHub repo → select `frontend/` as root directory
- Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
- Deploy automatically on every push to `main`

**4. Update CORS:**
Set `CORS_ORIGIN=https://your-app.vercel.app` on your Render backend.

---

## 🧪 Testing

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage
```

Tests are written with **Jest** + **Supertest** + **mongodb-memory-server** (no real DB needed).

---

## 🔮 Future Roadmap

- [ ] **Email notifications** — interview reminders, approval alerts (Resend/Nodemailer)
- [ ] **Cloudinary integration** — persistent image storage on cloud
- [ ] **Map view** — browse dogs by location using Google Maps / Leaflet
- [ ] **Vet integration** — veterinarian role for health certificates
- [ ] **Mobile app** — React Native companion app
- [ ] **AI matching** — recommend dogs based on adopter's lifestyle preferences
- [ ] **Payment gateway** — optional adoption fee processing

---

## 👨‍💻 Author

<div align="center">

**Mugesh**  
Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-mugesh81-181717?style=for-the-badge&logo=github)](https://github.com/mugesh81)

*Built with ❤️ for the dogs of Tamil Nadu*

</div>

---

<div align="center">

**⭐ If this project helped you or impressed you, please give it a star on GitHub!**

Made with Next.js · Express · MongoDB · TypeScript · TailwindCSS

</div>