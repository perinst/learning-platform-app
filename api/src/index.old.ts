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
    console.log('🚀 Learning Platform API Server');
    console.log('='.repeat(60));
    console.log(`📍 Server URL: http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`📡 PostgREST: ${config.postgrestUrl}`);
    console.log('='.repeat(60) + '\n');

    // Test database connection
    const dbConnected = await dbManager.testConnection();
    if (!dbConnected) {
        console.error('⚠️  Warning: Database connection failed. Some features may not work.');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');

    server.close(async () => {
        console.log('🔒 Server closed. Cleaning up...');

        try {
            await dbManager.close();
            console.log('✅ Cleanup complete. Exiting.');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⏱️  Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    server.close(async () => {
        await dbManager.close();
        console.log('✅ Server shut down complete.');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

export default app;
