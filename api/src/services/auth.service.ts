import { Pool } from 'pg';
import { AuthenticatedUser, AuthResponse } from '../types';

/**
 * Auth Service
 * Handles authentication business logic
 */
export class AuthService {
    private pool: Pool;
    private postgrestUrl: string;

    constructor(pool: Pool, postgrestUrl: string) {
        this.pool = pool;
        this.postgrestUrl = postgrestUrl;
    }

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/verify_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_email: email, p_password: password }),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: 'Invalid credentials',
                };
            }

            const data = await response.json();

            if (!data || !Array.isArray(data)) {
                return {
                    success: false,
                    error: 'Invalid credentials',
                };
            }

            const result = data[0];

            if (!result) {
                return {
                    success: false,
                    error: 'Information Invalid',
                };
            }

            return {
                success: true,
                data: {
                    token: result.token,
                    user: {
                        user_id: result.user_id,
                        email: result.email,
                        name: result.name,
                        role: result.role,
                    },
                    expiresAt: result.expires_at,
                },
            };
        } catch (error) {
            console.error('[AuthService] Login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed',
            };
        }
    }

    /**
     * Register new user
     */
    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/register_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_email: email, p_password: password, p_name: name }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: 'Registration failed',
                };
            }

            const data = await response.json();

            if (!data || !Array.isArray(data)) {
                return {
                    success: false,
                    error: 'Registration failed',
                };
            }

            const result = data[0];

            if (!result) {
                return {
                    success: false,
                    error: 'Registration failed',
                };
            }

            return {
                success: true,
                data: {
                    token: result.token,
                    user: {
                        user_id: result.user_id,
                        email: result.email,
                        name: result.name,
                        role: result.role,
                    },
                    expiresAt: result.expires_at,
                },
            };
        } catch (error) {
            console.error('[AuthService] Registration error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    }

    /**
     * Verify token
     */
    async verifyToken(token: string): Promise<AuthenticatedUser | null> {
        const client = await this.pool.connect();

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
            console.error('[AuthService] Token verification error:', error);
            return null;
        } finally {
            client.release();
        }
    }

    /**
     * Check if user is admin
     */
    async isAdmin(token: string): Promise<boolean> {
        const client = await this.pool.connect();

        try {
            const result = await client.query('SELECT is_admin($1) as is_admin', [token]);
            return result.rows[0]?.is_admin || false;
        } catch (error) {
            console.error('[AuthService] Admin check error:', error);
            return false;
        } finally {
            client.release();
        }
    }
}

/**
 * Legacy functions for backward compatibility
 */
export async function verifyToken(token: string): Promise<AuthenticatedUser | null> {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'learning_platform',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

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
        await pool.end();
    }
}

export async function isAdmin(token: string): Promise<boolean> {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'learning_platform',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    const client = await pool.connect();

    try {
        const result = await client.query('SELECT is_admin($1) as is_admin', [token]);
        return result.rows[0]?.is_admin || false;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    } finally {
        client.release();
        await pool.end();
    }
}
