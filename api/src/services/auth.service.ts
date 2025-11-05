import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'learning_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

interface User {
    user_id: string;
    email: string;
    name: string;
    role: string;
    token_expires_at: string;
}

/**
 * Verify token using PostgreSQL verify_token function
 */
export async function verifyToken(token: string): Promise<User | null> {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM verify_token($1)', [token]);

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];

        // Check if token is expired
        const expiresAt = new Date(user.token_expires_at);
        if (expiresAt < new Date()) {
            return null;
        }

        return {
            user_id: user.user_id,
            email: user.user_email,
            name: user.user_name,
            role: user.user_role,
            token_expires_at: user.token_expires_at,
        };
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    } finally {
        client.release();
    }
}

/**
 * Check if user is admin using PostgreSQL is_admin function
 */
export async function isAdmin(token: string): Promise<boolean> {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT is_admin($1) as is_admin', [token]);

        return result.rows[0]?.is_admin || false;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    } finally {
        client.release();
    }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✓ Database connection successful');
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error);
        return false;
    }
}
