const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config();

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use In-Memory MongoDB for development/demo only if no URI is provided
    if (!mongoUri) {
      console.log('Starting In-Memory MongoDB Server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('##############################################');
      console.log('DEMO MONGODB URI FOR COMPASS:');
      console.log(mongoUri);
      console.log('##############################################');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // If it failed, try starting memory server as a fallback
    if (!mongoServer) {
       console.log('Attempting fallback to In-Memory MongoDB...');
       mongoServer = await MongoMemoryServer.create();
       const conn = await mongoose.connect(mongoServer.getUri());
       console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
       return conn;
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
};

module.exports = connectDB;
