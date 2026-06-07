# 🐾 Dog Adoption Platform

<div align="center">
  <p><strong>A modern, full-stack application connecting loving homes with dogs in need.</strong></p>
</div>

---

## 📖 Overview

The **Dog Adoption Platform** is a web-based solution primarily aimed at preventing the deaths of abandoned dogs in Tamil Nadu, but easily adaptable for any region. It streamlines the adoption process by providing an intuitive interface for current owners (donors) to list their dogs, and for prospective adopters to find their new best friend. 

The application emphasizes safety, verifiability, and seamless real-time communication to ensure every dog goes to a loving, responsible home.

## ✨ Features

- **User Roles & Authentication**: Secure registration and login for both Donors and Adopters.
- **Detailed Dog Listings**: Comprehensive profiles for dogs including breed, age, health status, and images.
- **Adoption Workflow**: Adopters can browse, filter, and send adoption requests directly to donors.
- **Real-time Messaging**: Built-in chat functionality utilizing Socket.io for immediate communication between adopters and donors.
- **Responsive UI/UX**: A beautiful, modern interface built with Next.js and Tailwind CSS that looks great on both desktop and mobile.

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

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.