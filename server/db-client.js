import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

// Define Mongoose Schema
const ProxyConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  proxyTo: { type: String, required: true }
});

// Create model
const ProxyConfig = mongoose.model('ProxyConfig', ProxyConfigSchema);

// Connect to MongoDB
let isConnected = false;
export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    console.log('db-client.js connectDB connecting to MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('db-client.js MongoDB connected successfully');
    isConnected = true;
  } catch (err) {
    console.error('db-client.js connectDB MongoDB connection error', {message: err.message, stack: err.stack});
    process.exit(1);
  }
};

// Load configuration from database
export const getProxyConfigs = async () => {
  try {
    console.log('db-client.js getProxyConfigs fetching proxy configurations from DB');
    const configs = await ProxyConfig.find({});
    console.log(`db-client.js getProxyConfigs loaded ${configs.length} configurations`);
    return configs;
  } catch (err) {
    console.error('db-client.js getProxyConfigs error', {message: err.message, stack: err.stack});
    return [];
  }
};

// CRUD operations
export const addProxyConfig = async (configData) => {
  try {
    console.log('db-client.js addProxyConfig', {data: configData});
    const newConfig = new ProxyConfig(configData);
    await newConfig.save();
    return newConfig;
  } catch (err) {
    console.error('db-client.js addProxyConfig error', {message: err.message, stack: err.stack});
    throw err;
  }
};

export const updateProxyConfig = async (id, configData) => {
  try {
    console.log('db-client.js updateProxyConfig', {id, data: configData});
    const updatedConfig = await ProxyConfig.findByIdAndUpdate(
      id,
      configData,
      { new: true }
    );
    return updatedConfig;
  } catch (err) {
    console.error('db-client.js updateProxyConfig error', {message: err.message, stack: err.stack});
    throw err;
  }
};

export const deleteProxyConfig = async (id) => {
  try {
    console.log('db-client.js deleteProxyConfig', {id});
    const deletedConfig = await ProxyConfig.findByIdAndDelete(id);
    return deletedConfig;
  } catch (err) {
    console.error('db-client.js deleteProxyConfig error', {message: err.message, stack: err.stack});
    throw err;
  }
};

export default {
  connectDB,
  getProxyConfigs,
  addProxyConfig,
  updateProxyConfig,
  deleteProxyConfig
};