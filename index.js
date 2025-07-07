import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import utilsRoutes from './routes/utilsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', utilsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 