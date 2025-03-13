import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dbClient, { connectDB, getProxyConfigs } from './db-client.js';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function bindDynamicProxy(app) {
    // Proxies storage
    const proxies = {};
    
    // Reference to the current configuration (will be updated by the rpcHandler)
    let config = [];
    
    // Initialize MongoDB connection
    await connectDB();
    
    // Load initial configuration from database
    console.log('dynamic-proxy.js bindDynamicProxy initializing configuration from MongoDB');
    config = await getProxyConfigs();
    
    // Initialize proxies for all configurations
    initializeProxies(config);
    
    function initializeProxies(configurations) {
        console.log(`dynamic-proxy.js initializeProxies initializing ${configurations.length} proxies`);
        
        // Clear existing proxies
        Object.keys(proxies).forEach(host => {
            delete proxies[host];
        });
        
        // Create proxies for all configurations
        configurations.forEach(configItem => {
            console.log(
                'dynamic-proxy.js initializing proxy for',
                configItem.name,
                'at',
                configItem.domain,
                'to',
                configItem.proxyTo
            );
            
            proxies[configItem.domain] = createProxyMiddleware({
                target: `http://${configItem.proxyTo}`,
                changeOrigin: true,
                onError: (err, req, res) => {
                    console.error('dynamic-proxy.js onError:', {
                        message: err.message,
                        stack: err.stack,
                    });
                    res.status(500).send('Proxy Error');
                },
                logLevel: 'debug',
                logProvider: () => console,
                cookieDomainRewrite: false,
            });
        });
    }
    
    // Legacy reload endpoint (to maintain backward compatibility)
    app.get('/reload-config', async (req, res) => {
        console.log('dynamic-proxy.js /reload-config legacy endpoint called');
        // This is now a placeholder that just returns success
        // Actual reload happens through the RPC endpoint
        res.send('Configuration reloaded successfully');
    });

    // Set up a single dynamic proxy middleware to handle all routes
    const dynamicProxy = () => {
        // This middleware handles all requests
        return (req, res, next) => {
            const host = req.headers.host;
            const configItem = config.find((item) => item.domain === host);

            console.log(`dynamic-proxy.js handling request for host: ${host}`);

            if (proxies[host]) {
                console.log(
                    `dynamic-proxy.js proxying request to ${configItem.proxyTo}`
                );
                return proxies[host](req, res, next);
            }

            console.log(
                `dynamic-proxy.js no matching configuration found for host: ${host}`
            );
            next();
        };
    };

    // Return a function to update the config
    const updateConfig = (newConfig) => {
        console.log(`dynamic-proxy.js updateConfig received ${newConfig.length} configurations`);
        config = newConfig;
        // Reinitialize proxies with new configuration
        initializeProxies(newConfig);
    };

    // Serve static files from React app (in production)
    app.use(express.static(path.join(__dirname, '..', 'frontend/build')));

    // Apply the dynamic proxy middleware
    app.use('/', dynamicProxy());

    // Catch-all route to serve React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'frontend/build', 'index.html'));
    });

    // Return the updateConfig function to be used by rpc-route
    return { updateConfig };
}