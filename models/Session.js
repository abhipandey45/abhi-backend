import mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema(
{
mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:
true },
passkey: { type: String, required: true, unique: true },
active: { type: Boolean, default: true }
},
{ timestamps: true }
);
export default mongoose.model('Session', sessionSchema);