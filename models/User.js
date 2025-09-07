import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String, required: true },
        profilePicture: { type: String, default: '' },
        role: { type: String, enum: ['student', 'mentor'], required: true },
        passwordHash: { type: String, required: true },
        // Mentor-only fields
        teachingFields: { type: [String], default: [] },
        teachingKeywords: { type: [String], default: [] }
    },
    { timestamps: true, collection: 'user' }
);
export default mongoose.model('User', userSchema);
