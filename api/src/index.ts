import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createRouter } from './routes';
import DatabaseManager from './utils/database';
import { loadConfig, validateConfig } from './config/app.config';
import corsOptions from './config/cors.config';
import { errorMiddleware, notFoundMiddleware, requestLoggerMiddleware } from './middleware/common.middleware';

// Load environment variables
dotenv.config();

// Load and validate configuration
const config = loadConfig();
validateConfig(config);

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLoggerMiddleware);

// Initialize database
const dbManager = DatabaseManager.getInstance();

// Health check (before all other routes)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            service: 'Learning Platform API',
            timestamp: new Date().toISOString(),
        },
    });
});

// API Routes
app.use(createRouter(dbManager.getPool(), config.postgrestUrl, config.freeImageApiKey));

// 404 handler
app.use(notFoundMiddleware);

// Error handler (must be last)
app.use(errorMiddleware);

// Start server
const server = app.listen(config.port, async () => {
    console.log('\n' + '='.repeat(60));
    console.log('Learning Platform API Server');
    console.log('='.repeat(60));
    console.log(`Server URL: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`PostgREST: ${config.postgrestUrl}`);
    console.log('='.repeat(60) + '\n');

    // Test database connection
    const dbConnected = await dbManager.testConnection();
    if (!dbConnected) {
        console.error('⚠️  Warning: Database connection failed. Some features may not work.');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\nSIGTERM received. Shutting down gracefully...');

    server.close(async () => {
        console.log('Server closed. Cleaning up...');

        try {
            await dbManager.close();
            console.log('Cleanup complete. Exiting.');
            process.exit(0);
        } catch (error) {
            console.error('Error during cleanup:', error);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Shutting down gracefully...');
    server.close(async () => {
        await dbManager.close();
        console.log(' Server shut down complete.');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

app.post('/rpc/delete_lesson', authMiddleware, async (req, res) => {
    try {
        const response = await fetch(`${POSTGREST_URL}/rpc/delete_lesson`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[PROTECTED] Error calling PostgREST:', error);
        res.status(502).json({
            error: 'PostgREST connection error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Protected endpoints (require authentication and RBAC)
app.use(
    '*',
    authMiddleware,
    lessonAccessMiddleware,
    createProxyMiddleware({
        target: POSTGREST_URL,
        changeOrigin: true,
        onProxyReq: (proxyReq, req: express.Request) => {
            const user = req.user;
            console.log(`[PROTECTED] ${req.method} ${req.path} - User: ${user?.email} (${user?.role})`);

            // PostgREST requires special header for RPC calls
            if (req.path.startsWith('/rpc/')) {
                proxyReq.setHeader('Prefer', 'params=single-object');
            }

            // Remove Authorization header - don't send tokens to PostgREST
            proxyReq.removeHeader('Authorization');

            // Add user context to headers for PostgREST instead
            if (user) {
                proxyReq.setHeader('X-User-Id', user.user_id);
                proxyReq.setHeader('X-User-Email', user.email);
                proxyReq.setHeader('X-User-Role', user.role);
            }
        },
        onError: (err, req, res) => {
            console.error('[PROTECTED] Proxy Error:', err.message);
            if (!res.headersSent) {
                res.status(502).json({
                    error: 'PostgREST connection error',
                    message: 'Cannot connect to PostgREST. Make sure it is running on port 3001.',
                });
            }
        },
    })
);

app.listen(PORT, () => {
    console.log(`🚀 Auth Proxy Server running on port ${PORT}`);
    console.log(`📡 Proxying to PostgREST at ${POSTGREST_URL}`);
    console.log(`🔒 All requests require authentication except public routes`);
});
