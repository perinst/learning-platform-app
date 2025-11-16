-- Create tables for learning platform
-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for JWT-like token management
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'published')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    image_url TEXT,
    relevant_start_day INTEGER DEFAULT 1 CHECK (relevant_start_day >= 1 AND relevant_start_day <= 366),
    relevant_end_day INTEGER DEFAULT 366 CHECK (relevant_end_day >= 1 AND relevant_end_day <= 366),
    grade VARCHAR(50)
);

-- Progress table
CREATE TABLE progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    UNIQUE(user_id, lesson_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_lessons_created_by ON lessons(created_by);
CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_lessons_category ON lessons(category);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_chat_messages_user_lesson ON chat_messages(user_id, lesson_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

-- =====================================================
-- PASSWORD HASHING FUNCTIONS
-- =====================================================

-- Function to generate secure token
CREATE OR REPLACE FUNCTION generate_token()
RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64') || '.' ||
           encode(gen_random_bytes(32), 'base64') || '.' ||
           encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to register a new user with hashed password
CREATE OR REPLACE FUNCTION register_user(
    p_email VARCHAR,
    p_password TEXT,
    p_name VARCHAR,
    p_role VARCHAR DEFAULT 'user'
)
RETURNS TABLE(
    user_id UUID,
    user_email VARCHAR,
    user_name VARCHAR,
    user_role VARCHAR,
    user_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO users (email, password_hash, name, role)
    VALUES (p_email, crypt(p_password, gen_salt('bf')), p_name, p_role)
    RETURNING id, email, name, role, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify login credentials and generate token
CREATE OR REPLACE FUNCTION verify_login(
    p_email VARCHAR,
    p_password TEXT
)
RETURNS TABLE(
    user_id UUID,
    user_email VARCHAR,
    user_name VARCHAR,
    user_role VARCHAR,
    user_created_at TIMESTAMP WITH TIME ZONE,
    access_token VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user RECORD;
    v_token VARCHAR;
    v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Verify credentials
    SELECT id, email, name, role, created_at
    INTO v_user
    FROM users
    WHERE email = p_email
      AND password_hash = crypt(p_password, password_hash);

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Generate token
    v_token := generate_token();
    v_expires := NOW() + INTERVAL '7 days';

    -- Clean up old sessions for this user
    DELETE FROM user_sessions
    WHERE user_sessions.user_id = v_user.id
      AND user_sessions.expires_at < NOW();

    -- Create new session
    INSERT INTO user_sessions (user_id, token, expires_at)
    VALUES (v_user.id, v_token, v_expires);

    -- Return user info with token
    RETURN QUERY
    SELECT v_user.id AS user_id, v_user.email AS user_email, v_user.name AS user_name,
           v_user.role AS user_role, v_user.created_at AS user_created_at,
           v_token AS access_token, v_expires AS expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify token and get user info
CREATE OR REPLACE FUNCTION verify_token(
    p_token VARCHAR
)
RETURNS TABLE(
    user_id UUID,
    user_email VARCHAR,
    user_name VARCHAR,
    user_role VARCHAR,
    token_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Update last used time
    UPDATE user_sessions
    SET last_used_at = NOW()
    WHERE token = p_token
      AND user_sessions.expires_at > NOW();

    -- Return user info if token is valid
    RETURN QUERY
    SELECT u.id AS user_id, u.email AS user_email, u.name AS user_name,
           u.role AS user_role, s.expires_at AS token_expires_at
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = p_token
      AND s.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to logout (invalidate token)
CREATE OR REPLACE FUNCTION logout(
    p_token VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE token = p_token;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change password
CREATE OR REPLACE FUNCTION change_password(
    p_user_id UUID,
    p_old_password TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- Verify old password
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE id = p_user_id
          AND password_hash = crypt(p_old_password, password_hash)
    ) INTO v_valid;

    IF NOT v_valid THEN
        RETURN FALSE;
    END IF;

    -- Update to new password
    UPDATE users
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_user_id;

    -- Invalidate all sessions for security
    DELETE FROM user_sessions WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROLE-BASED ACCESS CONTROL (RBAC) FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_token VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    SELECT u.role INTO v_role
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = p_token
      AND s.expires_at > NOW();

    RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user ID from token
CREATE OR REPLACE FUNCTION get_user_id_from_token(p_token VARCHAR)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT s.user_id INTO v_user_id
    FROM user_sessions s
    WHERE s.token = p_token
      AND s.expires_at > NOW();

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create lesson (admin only)
CREATE OR REPLACE FUNCTION create_lesson(
    p_token VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_content TEXT,
    p_category VARCHAR,
    p_status VARCHAR,
    p_summary TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS TABLE(
    lesson_id UUID,
    lesson_title VARCHAR,
    lesson_description TEXT,
    lesson_category VARCHAR,
    lesson_status VARCHAR,
    lesson_created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    v_is_admin := is_admin(p_token);

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get user ID
    v_user_id := get_user_id_from_token(p_token);

    -- Create lesson
    RETURN QUERY
    INSERT INTO lessons (title, description, content, category, status, created_by, summary, image_url)
    VALUES (p_title, p_description, p_content, p_category, p_status, v_user_id, p_summary, p_image_url)
    RETURNING id, title, description, category, status, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update lesson (admin only)
CREATE OR REPLACE FUNCTION update_lesson(
    p_token VARCHAR,
    p_lesson_id BIGINT,
    p_title VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_summary TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    v_is_admin := is_admin(p_token);

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update lesson
    UPDATE lessons
    SET
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        content = COALESCE(p_content, content),
        status = COALESCE(p_status, status),
        category = COALESCE(p_category, category),
        summary = COALESCE(p_summary, summary)
    WHERE id = p_lesson_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete lesson (admin only)
CREATE OR REPLACE FUNCTION delete_lesson(
    p_token VARCHAR,
    p_lesson_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    v_is_admin := is_admin(p_token);

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Delete lesson
    DELETE FROM lessons WHERE id = p_lesson_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to lesson content
CREATE OR REPLACE FUNCTION has_lesson_access(
    p_user_id UUID,
    p_lesson_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_progress BOOLEAN;
    v_previous_completed BOOLEAN;
BEGIN
    -- Check if user has already started this lesson
    SELECT EXISTS(
        SELECT 1 FROM progress
        WHERE user_id = p_user_id AND lesson_id = p_lesson_id
    ) INTO v_has_progress;

    -- If user has progress, they have access
    IF v_has_progress THEN
        RETURN TRUE;
    END IF;

    -- Check if all previous lessons are completed (sequential access)
    -- A user can access a lesson if all lessons with lower IDs are completed
    SELECT NOT EXISTS(
        SELECT 1 FROM lessons l
        WHERE l.id < p_lesson_id
        AND l.status = 'published'
        AND NOT EXISTS(
            SELECT 1 FROM progress p
            WHERE p.user_id = p_user_id
            AND p.lesson_id = l.id
            AND p.completed = true
        )
    ) INTO v_previous_completed;

    RETURN v_previous_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get lessons with content filtering based on user access
CREATE OR REPLACE FUNCTION get_lessons_for_user(
    p_user_id UUID
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    content TEXT,
    category VARCHAR,
    status VARCHAR,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    image_url TEXT,
    has_access BOOLEAN,
    user_progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.title,
        l.description,
        CASE
            WHEN has_lesson_access(p_user_id, l.id) THEN l.content
            ELSE '🔒 This lesson is locked. Complete previous lessons to unlock.'
        END AS content,
        l.category,
        l.status,
        l.created_by,
        l.created_at,
        l.summary,
        l.image_url,
        has_lesson_access(p_user_id, l.id) AS has_access,
        COALESCE(p.progress, 0) AS user_progress
    FROM lessons l
    LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = p_user_id
    WHERE l.status = 'published'
    ORDER BY l.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single lesson with access control
CREATE OR REPLACE FUNCTION get_lesson_by_id(
    p_user_id UUID,
    p_lesson_id BIGINT
)
RETURNS TABLE(
    id BIGINT,
    title VARCHAR,
    description TEXT,
    content TEXT,
    category VARCHAR,
    status VARCHAR,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    image_url TEXT,
    has_access BOOLEAN,
    user_progress INTEGER,
    completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.title,
        l.description,
        CASE
            WHEN has_lesson_access(p_user_id, l.id) THEN l.content
            ELSE '🔒 This lesson is locked. Complete previous lessons to unlock.'
        END AS content,
        l.category,
        l.status,
        l.created_by,
        l.created_at,
        l.summary,
        l.image_url,
        has_lesson_access(p_user_id, l.id) AS has_access,
        COALESCE(p.progress, 0) AS user_progress,
        COALESCE(p.completed, false) AS completed
    FROM lessons l
    LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = p_user_id
    WHERE l.id = p_lesson_id AND l.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
