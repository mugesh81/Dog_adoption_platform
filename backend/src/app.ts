import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as any);
        console.log('Connected to MongoDB');
    } catch (err: any) {
        console.error('MongoDB connection error:', err);
    }
};
connectDB();

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Set up routes
app.use('/api', routes());

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend connection
    methods: ['GET', 'POST']
  }
});

// Setup Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room based on user ID or application ID
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', (data) => {
    // data = { room, sender, text }
    io.to(data.room).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});