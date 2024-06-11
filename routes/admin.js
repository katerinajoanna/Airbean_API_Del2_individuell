import express from 'express';

import { createAdmin } from '../controllers/adminController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

// sökväg att skapa ny admin
router.post('/create', createAdmin);

//  middleware verifyAdmin
router.post('/login', verifyAdmin, (req, res) => {
    res.status(200).json({ message: 'Admin logged in successfully', user: req.user });
});

export default router;