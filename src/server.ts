import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models'; // Import all models to ensure associations are set up

dotenv.config();

const PORT = process.env.PORT || 3000;

// Sync database
sequelize.sync({ alter: process.env.NODE_ENV === 'development' }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});