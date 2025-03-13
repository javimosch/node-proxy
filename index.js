import express from 'express';
import bindDynamicProxy from './server/dynamic-proxy.js';
import setupRpcRoute from './server/rpc-route.js';

// Main async function to initialize the application
const initializeApp = async () => {
  const app = express();
  const port = 3005;
  
  console.log('index.js initializing dynamic proxy');
  const { updateConfig } = await bindDynamicProxy(app);
  
  console.log('index.js setting up RPC route');
  const rpcHandler = setupRpcRoute(app);
  
  // Connect the RPC route's configuration update mechanism to the dynamic proxy
  // This ensures when configs are updated through RPC, the proxy is also updated
  const originalGetConfig = rpcHandler.getConfig;
  rpcHandler.getConfig = () => {
    const config = originalGetConfig();
    updateConfig(config);
    return config;
  };
  
  app.listen(port, () => {
    console.log(`index.js app.listen Proxy server listening on port ${port}`);
  });
};

// Start the application
initializeApp().catch(err => {
  console.error('index.js initialization error', {message: err.message, stack: err.stack});
  process.exit(1);
});