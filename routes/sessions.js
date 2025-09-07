import express from 'express';
import { auth } from '../middleware/auth.js';
import Session from '../models/Session.js';
function randomPasskey() {
    return Math.random().toString().slice(2, 8); // 6 digits
}
const router = express.Router();
// Mentor creates a whiteboard session (returns passkey)
router.post('/create', auth('mentor'), async (req, res) => {
    let passkey;
    for (; ;) {
        passkey = randomPasskey();
        const exists = await Session.findOne({ passkey });
        if (!exists) break;
    }
    const session = await Session.create({
        mentor: req.user.id, passkey, active:
            true
    });
    res.json({ passkey, sessionId: session._id });
});
// Student validates passkey to join
router.get('/validate/:passkey', async (req, res) => {
    const s = await Session.findOne({
        passkey: req.params.passkey, active:
            true
    });
    if (!s) return res.json({ valid: false });
    res.json({ valid: true, mentorId: s.mentor });
});
// Mentor ends session
router.post('/end', auth('mentor'), async (req, res) => {
    const { passkey } = req.body;
    await Session.findOneAndUpdate({ passkey, mentor: req.user.id }, {
        active:
            false
    });
    res.json({ ok: true });
});
export default router;