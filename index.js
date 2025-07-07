import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import utilsRoutes from './routes/utilsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', utilsRoutes);
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 