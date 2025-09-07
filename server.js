import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server as IOServer } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import mentorsRoutes from './routes/mentors.js';
import contactRoutes from './routes/contact.js';
import sessionsRoutes from './routes/sessions.js';

const app = express();

// Creating server //    Date : 03/09/2025 By - abhishek
const server = http.createServer(app);

const io = new IOServer(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || '*',
        methods: ['GET', 'POST']
    }
});

// In-memory board state per room (simple + ephemeral)
const roomBoards = new Map(); // passkey -> array of strokes

// socket bridge connection  Added By - abhishek
io.on('connection', (socket) => {
    socket.on('join_room', (passkey) => {
        socket.join(passkey);
        const state = roomBoards.get(passkey) || [];
        socket.emit('board_state', state);
    });
    socket.on('draw', ({ passkey, stroke }) => {
        const arr = roomBoards.get(passkey) || [];
        arr.push(stroke);
        roomBoards.set(passkey, arr);
        socket.to(passkey).emit('draw', stroke);
    });
    socket.on('clear_board', (passkey) => {
        roomBoards.set(passkey, []);
        io.to(passkey).emit('clear_board');
    });
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));

app.use(express.json({ limit: '1mb' }));

app.use(cookieParser());

// DB using here Mongo
await connectDB(process.env.MONGO_URI);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sessions', sessionsRoutes);
app.get('/', (_, res) => res.send('Edu_Tech API is running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
