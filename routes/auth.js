import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('name').notEmpty(),
        body('email').isEmail(),
        body('phone').notEmpty(),
        body('password').isLength({ min: 6 }),
        body('role').isIn(['student', 'mentor'])
    ],
    async (req, res) => {
        console.log("***RESPONSE***");
        console.log(req.body.name);

        const errors = validationResult(req);
        console.log("Error-Found -", errors)
        if (!errors.isEmpty()) return res.status(400).json({
            errors:
                errors.array()
        });

        const { name, email, phone, profilePicture, role, password, teachingFields, teachingKeywords } = req.body;
        console.log("Request --", req.body);
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email alreadyregistered' });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            phone,
            profilePicture: profilePicture || '',
            role,
            passwordHash,
            teachingFields: role === 'mentor' ? (teachingFields || []) : [],
            teachingKeywords: role === 'mentor' ? (teachingKeywords || []) : []
        });
        console.log("UserList ---", user);
        const token = jwt.sign({ id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log("Final UserList with Token -", user, token);
        res.json({ token, user });
    }
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({
            errors:
                errors.array()
        });
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    });

router.get('/me', auth(), async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    res.json({ user });
});
export default router;