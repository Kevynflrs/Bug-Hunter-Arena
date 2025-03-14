import express from 'express';
import roomRoutes from './routes/roomRoutes';

const app = express();
app.use(express.json());
app.use('/api', roomRoutes);

export default app;