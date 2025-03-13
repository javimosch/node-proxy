import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('populate-db.js connectDB connecting to MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('populate-db.js MongoDB connected successfully');
  } catch (err) {
    console.error('populate-db.js connectDB MongoDB connection error', { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

// Define Mongoose Schema
const ProxyConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  proxyTo: { type: String, required: true }
});

// Create model
const ProxyConfig = mongoose.model('ProxyConfig', ProxyConfigSchema);

// Function to read config file
const readConfig = () => {
  try {
    console.log(`populate-db.js readConfig reading ${CONFIG_FILE}`);
    return JSON.parse(fs.readFileSync(CONFIG_FILE));
  } catch (err) {
    console.error('populate-db.js readConfig error:', { message: err.message, stack: err.stack });
    return [];
  }
};

// Main function to populate the database
const populateDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Read configuration from file
    const config = readConfig();
    console.log(`populate-db.js populateDB Found ${config.length} configurations to import`);
    
    // Delete all existing documents
    await ProxyConfig.deleteMany({});
    console.log('populate-db.js populateDB Cleared existing configurations');
    
    // Insert each configuration
    for (const item of config) {
      console.log(`populate-db.js populateDB Inserting ${item.name} (${item.domain} → ${item.proxyTo})`);
      const newConfig = new ProxyConfig(item);
      await newConfig.save();
    }
    
    console.log('populate-db.js populateDB Database population completed successfully');
    
    // Count the documents in the collection
    const count = await ProxyConfig.countDocuments();
    console.log(`populate-db.js populateDB Total configurations in database: ${count}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('populate-db.js populateDB MongoDB disconnected');
    
  } catch (err) {
    console.error('populate-db.js populateDB error', { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

// Execute the populate function
populateDB();