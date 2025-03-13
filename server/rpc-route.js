import express from 'express';
import dbClient, {
  connectDB,
  getProxyConfigs,
  addProxyConfig,
  updateProxyConfig,
  deleteProxyConfig
} from './db-client.js';

// Connect to MongoDB
await connectDB();

// Load configuration from database
let config = [];
const loadConfigFromDB = async () => {
  try {
    console.log('rpc-route.js loadConfigFromDB fetching proxy configurations from DB');
    config = await getProxyConfigs();
    console.log(`rpc-route.js loadConfigFromDB loaded ${config.length} configurations`);
    return config;
  } catch (err) {
    console.error('rpc-route.js loadConfigFromDB error', {message: err.message, stack: err.stack});
    return [];
  }
};

// Initial load
await loadConfigFromDB();

export default function setupRpcRoute(app) {
  // Add middleware to parse JSON bodies
  app.use(express.json());

  // RPC endpoint for UI
  app.post('/api/rpc', async (req, res) => {
    try {
      console.log('rpc-route.js /api/rpc handling RPC request', { action: req.body.action, id: req.body.id });
      
      switch (req.body.action) {
        case 'getConfig':
          console.log('rpc-route.js /api/rpc getConfig');
          const configs = await getProxyConfigs();
          return res.json({ success: true, data: configs });
        
        case 'addConfig':
          console.log('rpc-route.js /api/rpc addConfig', { data: req.body.data });
          const newConfig = await addProxyConfig(req.body.data);
          await loadConfigFromDB(); // Reload config
          return res.json({ success: true, data: newConfig });
        
        case 'updateConfig':
          console.log('rpc-route.js /api/rpc updateConfig', { id: req.body.id, data: req.body.data });
          const updatedConfig = await updateProxyConfig(req.body.id, req.body.data);
          
          if (!updatedConfig) {
            return res.status(404).json({ success: false, message: 'Config not found' });
          }
          
          await loadConfigFromDB(); // Reload config
          return res.json({ success: true, data: updatedConfig });
        
        case 'deleteConfig':
          console.log('rpc-route.js /api/rpc deleteConfig', { id: req.body.id });
          const deletedConfig = await deleteProxyConfig(req.body.id);
          
          if (!deletedConfig) {
            return res.status(404).json({ success: false, message: 'Config not found' });
          }
          
          await loadConfigFromDB(); // Reload config
          return res.json({ success: true, message: 'Config deleted successfully' });
        
        case 'reloadConfig':
          console.log('rpc-route.js /api/rpc reloadConfig');
          await loadConfigFromDB();
          return res.json({ success: true, message: 'Configuration reloaded successfully' });
        
        default:
          console.log('rpc-route.js /api/rpc unknown action', { action: req.body.action });
          return res.status(400).json({ success: false, message: 'Unknown action' });
      }
    } catch (err) {
      console.error('rpc-route.js /api/rpc error', { message: err.message, stack: err.stack });
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  // API routes
  app.use('/api', (req, res, next) => {
    if (req.path === '/rpc') {
      return next();
    }
    res.status(404).send('API endpoint not found');
  });
  
  // Export the config for use in dynamic-proxy
  return {
    getConfig: () => config
  };
}