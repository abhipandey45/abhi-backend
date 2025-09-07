import mongoose from 'mongoose';

export async function connectDB(uri) {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));
