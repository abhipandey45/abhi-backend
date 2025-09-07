import express from "express";
import User from "../models/User.js"; // mongoose model
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * CREATE USER
 * POST /api/users
 */
router.post("/", async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const doc = {
            name,
            email,
            role,
            createdAt: new Date(),
        };

        // MongoDB insert query
        const result = await User.collection.insertOne(doc);

        res.status(201).json({ insertedId: result.insertedId, doc });
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * READ USERS (with filter + projection)
 * GET /api/users?role=mentor
 */
router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;

        const projection = { passwordHash: 0 }; // exclude sensitive field

        const cursor = User.collection.find(filter, { projection });
        const users = await cursor.toArray();

        res.json({ users, query: filter });
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * UPDATE USER
 * PUT /api/users/:id
 */
router.put("/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;

        const q = { _id: User.castObjectId(id) }; // filter
        const payload = { $set: {} };

        if (req.body.name) payload.$set.name = req.body.name;
        if (req.body.phone) payload.$set.phone = req.body.phone;

        const result = await User.collection.updateOne(q, payload);

        if (result.matchedCount === 0)
            return res.status(404).json({ message: "User not found" });

        res.json({ matched: result.matchedCount, modified: result.modifiedCount, query: q, update: payload });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * DELETE USER
 * DELETE /api/users/:id
 */
router.delete("/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;

        const q = { _id: User.castObjectId(id) };

        const result = await User.collection.deleteOne(q);

        if (result.deletedCount === 0)
            return res.status(404).json({ message: "User not found" });

        res.json({ deleted: result.deletedCount, query: q });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
