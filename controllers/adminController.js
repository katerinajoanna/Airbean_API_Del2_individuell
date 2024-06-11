
import db from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

export const createAdmin = (req, res) => {
    const { adminname, password } = req.body;

    if (!adminname || !password) {
        return res.status(400).json({ error: 'Admin name and password are required' });
    }

    const newAdmin = {
        adminId: uuidv4(),
        adminname,
        password,
        role: 'admin',
        createdAt: new Date()
    };

    db.insert(newAdmin, (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create admin' });
        }
        res.status(201).json({ message: 'Admin created successfully', admin });
    });
};
