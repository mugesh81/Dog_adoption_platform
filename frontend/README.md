# Dog Adoption Platform

## Overview
The Dog Adoption Platform is a web application designed to prevent the deaths of abandoned dogs in Tamil Nadu. It connects dog owners who wish to donate their dogs with potential adopters looking to provide a loving home. The platform features a user-friendly interface, donor and adopter registration, dog listings, adoption requests, and a verification system.

## Features
- **User Registration**: Separate registration forms for donors and adopters.
- **Dog Listings**: Donors can list their dogs with details such as age, breed, health, and location.
- **Adoption Requests**: Adopters can browse available dogs and send adoption requests.
- **Verification System**: Ensures that adopters are verified before they can adopt a dog.
- **Responsive Design**: Built with Tailwind CSS for a modern and responsive user interface.

## Tech Stack
- **Frontend**: React.js or Next.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB or MySQL
- **Deployment**: AWS, Vercel, or Firebase

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.
- MongoDB or MySQL database set up.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd dog-adoption-platform
   ```

2. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

3. Navigate to the backend directory and install dependencies:
   ```
   cd ../backend
   npm install
   ```

4. Set up your database and update the connection string in the backend configuration.

### Running the Application

- To start the backend server:
  ```
  cd backend
  npm start
  ```

- To start the frontend application:
  ```
  cd frontend
  npm run dev
  ```

### Deployment
Follow the instructions in the `deployment` directory to deploy the application on your preferred platform (AWS, Vercel, or Firebase).

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.