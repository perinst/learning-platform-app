import { Pool } from 'pg';

/**
 * Database Connection Manager
 * Manages PostgreSQL connection pool
 */
class DatabaseManager {
    private static instance: DatabaseManager;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'learning_platform',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20, // Maximum pool size
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection fails
        });

        this.pool.on('error', (err) => {
            console.error('[Database] Unexpected error on idle client', err);
        });
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * Get connection pool
     */
    public getPool(): Pool {
        return this.pool;
    }

    /**
     * Test database connection
     */
    public async testConnection(): Promise<boolean> {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✓ Database connection successful');
            return true;
        } catch (error) {
            console.error('✗ Database connection failed:', error);
            return false;
        }
    }

    /**
     * Close all connections
     */
    public async close(): Promise<void> {
        await this.pool.end();
        console.log('✓ Database connections closed');
    }
}

export default DatabaseManager;
