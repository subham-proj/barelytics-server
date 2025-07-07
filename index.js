import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import testRoutes from './routes/testRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Use the test routes
app.use('/', testRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 