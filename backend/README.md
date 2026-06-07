# Dog Adoption Platform Backend

## Overview
This backend application serves as the server-side component of the Dog Adoption Platform, aimed at preventing the deaths of abandoned dogs in Tamil Nadu. It provides a RESTful API for dog owners to donate their dogs and for adopters to adopt them.

## Technologies Used
- Node.js
- Express.js
- TypeScript
- MongoDB (with Mongoose)

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd dog-adoption-platform/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Configuration
- Create a `.env` file in the root of the backend directory and add your MongoDB connection string:
  ```
  MONGODB_URI=<your_mongodb_connection_string>
  ```

### Running the Application
1. Start the server:
   ```
   npm run start
   ```

2. The server will run on `http://localhost:5000`.

### API Endpoints
- **Donor Endpoints**
  - `POST /donors/register`: Register a new donor.
  - `GET /dogs`: List all available dogs for adoption.
  - `GET /dogs/:id`: Get details of a specific dog.

- **Adopter Endpoints**
  - `POST /adopters/register`: Register a new adopter.
  - `GET /adopters/browse`: Browse available dogs for adoption.
  - `POST /adoption-request`: Send an adoption request for a specific dog.

### Testing
- Ensure to write tests for your controllers and services to maintain code quality.

### Deployment
- Follow the instructions in the deployment directory for deploying the application on AWS, Vercel, or Firebase.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.