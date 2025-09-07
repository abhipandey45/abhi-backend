import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.put('/me', auth(), async (req, res) => {
    const { name, phone, profilePicture, teachingFields, teachingKeywords } = req.body;
    const update = { name, phone, profilePicture };
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: 'Not found' });
    if (me.role === 'mentor') {
        if (Array.isArray(teachingFields)) update.teachingFields = teachingFields;
        if (Array.isArray(teachingKeywords)) update.teachingKeywords = teachingKeywords;
    }
    const updated = await User.findByIdAndUpdate(req.user.id, update, { new:true });
    res.json({ user: updated });
});

router.get('/:id', auth(), async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user });
});

export default router;