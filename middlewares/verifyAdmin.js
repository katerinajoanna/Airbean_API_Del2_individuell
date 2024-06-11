import db from '../db/index.js';

const verifyAdmin = (req, res, next) => {
    const { adminname, password } = req.body;

    if (!adminname || !password) {
        return res.status(400).json({ error: 'Admin name and password are required' });
    }

    // hitta en användare i databasen
    db.findOne({ adminname, password, role: 'admin' }, (err, admin) => {
        if (err || !admin) {
            return res.status(403).json({ error: 'Invalid login credentials' });
        }

        req.user = admin; // lagring av användarinformation i req
        next();
    });
};

export default verifyAdmin;
