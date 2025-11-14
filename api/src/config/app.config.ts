/**
 * Environment Configuration
 * Centralized configuration management
 */

export interface AppConfig {
    // Server
    port: number;
    nodeEnv: string;

    // Database
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };

    // PostgREST
    postgrestUrl: string;

    // External APIs
    freeImageApiKey: string;

    // CORS
    allowedOrigins: string[];

    // Security
    jwtSecret?: string;
    tokenExpiry?: string;
}

/**
 * Load and validate configuration
 */
export function loadConfig(): AppConfig {
    // Check for missing environment variables and log warnings
    const warnings: string[] = [];

    if (!process.env.PORT) warnings.push('PORT');
    if (!process.env.NODE_ENV) warnings.push('NODE_ENV');
    if (!process.env.DB_HOST) warnings.push('DB_HOST');
    if (!process.env.DB_PORT) warnings.push('DB_PORT');
    if (!process.env.DB_NAME) warnings.push('DB_NAME');
    if (!process.env.DB_USER) warnings.push('DB_USER');
    if (!process.env.DB_PASSWORD) warnings.push('DB_PASSWORD');
    if (!process.env.POSTGREST_URL) warnings.push('POSTGREST_URL');
    if (!process.env.FREEIMAGE_API_KEY) warnings.push('FREEIMAGE_API_KEY');
    if (!process.env.JWT_SECRET) warnings.push('JWT_SECRET');
    if (!process.env.TOKEN_EXPIRY) warnings.push('TOKEN_EXPIRY');

    if (warnings.length > 0) {
        console.warn('⚠️  Warning: Missing environment variables:', warnings.join(', '));
        console.warn('Using fallback values. Please set these in your .env file.');
    }

    return {
        // Server
        port: parseInt(process.env.PORT || '4000'),
        nodeEnv: process.env.NODE_ENV || 'development',

        // Database
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            name: process.env.DB_NAME || 'learning_platform',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        },

        // PostgREST
        postgrestUrl: process.env.POSTGREST_URL || 'http://127.0.0.1:3001',

        // External APIs
        freeImageApiKey: process.env.FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5',

        // CORS
        allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:5174',
            'https://zlearning.vercel.app',
            'https://ui.sgk.guidestaredu.com',
            'https://api.learning-platform-app.guidestaredu.com',
        ],

        // Security
        jwtSecret: process.env.JWT_SECRET,
        tokenExpiry: process.env.TOKEN_EXPIRY || '7d',
    };
}

/**
 * Validate required environment variables
 */
export function validateConfig(config: AppConfig): void {
    const required = ['port', 'database.host', 'database.port', 'database.name', 'database.user', 'postgrestUrl'];

    const missing: string[] = [];

    required.forEach((key) => {
        const keys = key.split('.');
        let value: AppConfig | string | number | { [key: string]: string | number } | undefined = config;

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = (value as Record<string, unknown>)[k] as
                    | AppConfig
                    | string
                    | number
                    | { [key: string]: string | number }
                    | undefined;
            } else {
                value = undefined;
                break;
            }
        }

        if (!value) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default loadConfig;
