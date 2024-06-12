import express from 'express';
import cors from 'cors';

import aboutRouter from './routes/about.js'
import orderRoutes from './routes/orders.js';
import productsRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import menuRoutes, { insertMenu } from './db/menu.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use('/about', aboutRouter);
app.use('/orders', orderRoutes);
app.use('/products', productsRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/menu', menuRoutes);

insertMenu((err) => {
    if (err) {
        console.error('Wystąpił błąd podczas dodawania menu:', err);
    } else {
        console.log('Menu zostało dodane do bazy danych.');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});