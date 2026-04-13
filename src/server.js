const app = require('./app');
const connectDB = require('./config/mongodb');
const seedMongoData = require('./config/mongo_seeder');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database connection
    await connectDB();
    
    // Seed initial data
    await seedMongoData();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
