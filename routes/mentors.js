import express from 'express';
import User from '../models/User.js';
const router = express.Router();
// Search keys across name, teachingFields, teachingKeywords
router.get('/list', async (req, res) => {
    const { q } = req.query;
    let filter = { role: 'mentor' };
    if (q && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        filter.$or = [
            { name: regex },
            { teachingFields: regex },
            { teachingKeywords: regex }
        ];
    }
    const mentors = await User.find(filter).select('-passwordHash').sort({
        createdAt: -1
    }).limit(100);
    res.json({ mentors });
});
export default router;