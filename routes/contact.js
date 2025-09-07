import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
router.post('/mentor', auth(), async (req, res) => {
    const { mentorId, message } = req.body;
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') return res.status(404).json({
        message: 'Mentor not found'
    });
    console.log(req.user.id);
    const me = await User.findById(req.user.id);
    const subject = `New Student Inquiry from ${me.name}`;
    const text = `Student ${me.name} (${me.email}, ${me.phone}) says:\n\n$
{message || '(no message)'}\n\nPlease reply to the student directly.`;
    await sendEmail({ to: mentor.email, subject, text });
    res.json({ ok: true });
});
export default router;