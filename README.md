# 🐾 Dog Adoption Platform (PAWS)

<div align="center">
  <p><strong>A modern, full-stack application connecting loving homes with dogs in need.</strong></p>
  <p><em>Phase 1 Complete ✅ • Phase 2 In Progress 🚧</em></p>
</div>

---

## 📖 Overview

The **Dog Adoption Platform** is a web-based solution primarily aimed at preventing the deaths of abandoned dogs in Tamil Nadu, but easily adaptable for any region. It streamlines the adoption process by providing an intuitive interface for current owners (donors/shelters) to list their dogs, and for prospective adopters to find their new best friend. 

The application emphasizes safety, verifiability, and seamless communication to ensure every dog goes to a loving, responsible home.

## ✨ Features (Phase 1 Complete)

**Authentication & Authorization:**
- ✅ Secure JWT-based authentication with role-based access control
- ✅ Registration restricted to: adopter, donor, shelter (no public admin signup)
- ✅ Password minimum 6 characters validation
- ✅ Protected admin panel for platform-wide oversight

**Dog Listings (V2 API):**
- ✅ Detailed dog profiles with breed, age, health status, vaccination records, and images
- ✅ Browse & filter: location, vaccination status, health condition, age range
- ✅ Donors/shelters can create listings (requires authentication)
- ✅ Public browsing without login

**Adoption Workflow:**
- ✅ Adopters submit structured applications (reason, home type, experience)
- ✅ Application status tracking: pending → under_review → approved/rejected
- ✅ Automatic rejection of competing applications when one is approved
- ✅ Role-specific dashboards: adopters see their apps, donors/shelters manage incoming requests

**Admin Capabilities:**
- ✅ View all platform applications
- ✅ Approve/reject any application
- ✅ Platform-wide statistics (available dogs, adopters, donors)

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State/API**: Axios with JWT interceptor
- **Real-time**: Socket.io-client (infrastructure ready for Phase 2)

### Backend
- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Real-time**: Socket.io (infrastructure ready for Phase 2)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or MongoDB Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dog-adoption-platform.git
   cd dog-adoption-platform
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment variables file
   cp .env.example .env
   # Update .env with your MongoDB URI and JWT secret
   
   # Start the backend server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Create environment variables file
   cp .env.local.example .env.local
   
   # Start the frontend server
   npm run dev
   ```

4. **Seed Test Data**
   ```bash
   cd backend
   npm run seed
   ```
   This creates:
   - **Admin**: admin@paws.org / admin123
   - **Adopter**: adopter@test.com / adopter123
   - **Shelter**: tamilnadurelief@paws.org / shelter123
   - **6 dog listings** from various Tamil Nadu locations

5. **View the App**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api`

## 📂 Project Structure

```
dog-adoption-platform/
│
├── backend/                  # Express/Node.js server (V2 API)
│   ├── src/
│   │   ├── app.ts            # Entry point & Express setup
│   │   ├── models/           # Mongoose schemas (User, Dog, AdoptionApplication)
│   │   ├── controllers/      # V2 controllers (Auth, Dog, Application)
│   │   ├── routes/           # API endpoints
│   │   ├── middlewares/      # JWT auth & role authorization
│   │   └── services/         # [Deprecated v1 services]
│   ├── uploads/              # Dog images (ignored by git)
│   ├── seed.ts               # Database seeding script
│   ├── clear.ts              # Database cleanup script
│   └── package.json
│
└── frontend/                 # Next.js application
    ├── src/
    │   ├── components/       # Reusable React components
    │   ├── pages/            # Next.js pages & routing
    │   ├── context/          # Auth context
    │   ├── utils/            # API client & helpers
    │   └── styles/           # Global styles
    └── package.json
```

## 🔐 Test Accounts

After running `npm run seed` in the backend:

| Role    | Email                          | Password   | Purpose                          |
|---------|--------------------------------|------------|----------------------------------|
| Admin   | admin@paws.org                 | admin123   | Platform oversight, approve all  |
| Adopter | adopter@test.com               | adopter123 | Apply for dog adoptions          |
| Shelter | tamilnadurelief@paws.org       | shelter123 | List dogs, manage applications   |
| Donors  | See seed output                | donor123   | List dogs, manage applications   |

## 🧪 Development Commands

**Backend:**
```bash
cd backend
npm run dev      # Start dev server with hot-reload
npm run seed     # Populate database with test data
npm run clear    # Clear all data from database
npm run build    # Compile TypeScript
```

**Frontend:**
```bash
cd frontend
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Phase 2 Features (In Progress)

1. **Donor/Shelter Listing Management**
   - Edit and delete own dog listings
   - Mark dogs as adopted/inactive
   - Enhanced listing form validation

2. **Interview Scheduling**
   - Propose interview dates when approving applications
   - Adopter can confirm or request different time
   - Interview status tracking

3. **In-App Notifications**
   - Status change alerts for adopters
   - New application alerts for donors/shelters
   - Read/unread notification tracking

4. **Password Reset Flow**
   - Forgot password with email token
   - Token expiry (1 hour)
   - Secure password update

5. **Design Unification**
   - Consistent component styling across all pages
   - Unified color scheme and spacing
   - Improved mobile responsiveness

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State/Data**: Axios, Framer Motion
- **Real-time**: Socket.io-client

### Backend
- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Socket.io
- **Security**: JWT for Authentication, bcryptjs for password hashing

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/download/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a MongoDB Atlas URI)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/dog-adoption-platform.git
   cd dog-adoption-platform
   ```

2. **Setup Backend**
   ```sh
   cd backend
   npm install
   
   # Create environment variables file
   cp .env.example .env
   # Make sure to update the .env file with your actual MongoDB URI and a secure JWT Secret
   
   # Start the backend development server
   npm run dev
   ```

3. **Setup Frontend**
   ```sh
   # Open a new terminal and navigate to the project root, then into frontend
   cd frontend
   npm install
   
   # Create environment variables file
   cp .env.local.example .env.local
   
   # Start the frontend development server
   npm run dev
   ```

4. **View the App**
   Open your browser and navigate to `http://localhost:3000`. The backend API runs on `http://localhost:5000`.

## 📂 Project Structure

```
dog-adoption-platform/
│
├── backend/                  # Express/Node.js server
│   ├── src/
│   │   ├── app.ts            # Entry point & Express setup
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API Endpoints
│   │   └── ...
│   ├── uploads/              # Dog image uploads (ignored by git)
│   └── package.json
│
└── frontend/                 # Next.js application
    ├── src/
    │   ├── components/       # Reusable React components
    │   ├── pages/            # Next.js pages & routing
    │   └── ...
    └── package.json
```

## 🏗 Architecture Notes

**V2 API (Current):**
- Models: `User`, `Dog`, `AdoptionApplication`
- Routes: `/api/auth`, `/api/dogs-v2`, `/api/applications`, `/api/stats`
- All new features built on v2 architecture

**Legacy V1 (Deprecated):**
- Models: `Donor`, `Adopter`, `DogLegacy`, `AdoptionRequest`
- Routes: `/api/donors/*`, `/api/adopters/*`, `/api/dogs` (not `/dogs-v2`)
- Kept for backward compatibility only — DO NOT USE in new code

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p><strong>Built with ❤️ for Tamil Nadu's abandoned dogs</strong></p>
  <p><em>Every dog deserves a second chance at life.</em></p>
</div>