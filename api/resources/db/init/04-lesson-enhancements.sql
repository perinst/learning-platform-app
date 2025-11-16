-- Migration: Add Real-World Applications and Multiple Choice Questions
-- This migration adds support for lesson applications and quiz questions

-- =====================================================
-- NEW TABLES
-- =====================================================

-- Real-world applications table
CREATE TABLE lesson_applications (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multiple choice questions table
CREATE TABLE lesson_questions (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Question choices table
CREATE TABLE question_choices (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES lesson_questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_lesson_applications_lesson_id ON lesson_applications(lesson_id);
CREATE INDEX idx_lesson_applications_order ON lesson_applications(lesson_id, display_order);
CREATE INDEX idx_lesson_questions_lesson_id ON lesson_questions(lesson_id);
CREATE INDEX idx_lesson_questions_order ON lesson_questions(lesson_id, display_order);
CREATE INDEX idx_question_choices_question_id ON question_choices(question_id);
CREATE INDEX idx_question_choices_order ON question_choices(question_id, display_order);

-- =====================================================
-- ENHANCED LESSON FUNCTIONS
-- =====================================================

-- Function to create lesson with all related content
CREATE OR REPLACE FUNCTION create_lesson_with_content(
    p_token VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_content TEXT,
    p_category VARCHAR,
    p_status VARCHAR,
    p_summary TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_applications JSONB DEFAULT '[]'::jsonb,
    p_questions JSONB DEFAULT '[]'::jsonb,
    p_relevant_start_day INTEGER DEFAULT 1,
    p_relevant_end_day INTEGER DEFAULT 366,
    p_grade VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_user_role VARCHAR;
    v_new_lesson_id BIGINT;
    v_app JSONB;
    v_question JSONB;
    v_choice JSONB;
    v_question_id BIGINT;
BEGIN
    -- Verify token and get user info
    SELECT user_id, user_role INTO v_user_id, v_user_role
    FROM verify_token(p_token);

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;

    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can create lessons';
    END IF;

    -- Create lesson
    INSERT INTO lessons (title, description, content, category, status, created_by, summary, image_url, relevant_start_day, relevant_end_day, grade)
    VALUES (p_title, p_description, p_content, p_category, p_status, v_user_id, p_summary, p_image_url, p_relevant_start_day, p_relevant_end_day, p_grade)
    RETURNING id INTO v_new_lesson_id;

    -- Insert applications if provided
    IF p_applications IS NOT NULL AND jsonb_array_length(p_applications) > 0 THEN
        FOR v_app IN SELECT * FROM jsonb_array_elements(p_applications)
        LOOP
            INSERT INTO lesson_applications (lesson_id, title, description, display_order)
            VALUES (
                v_new_lesson_id,
                v_app->>'title',
                v_app->>'description',
                COALESCE((v_app->>'display_order')::INTEGER, 0)
            );
        END LOOP;
    END IF;

    -- Insert questions if provided
    IF p_questions IS NOT NULL AND jsonb_array_length(p_questions) > 0 THEN
        FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
        LOOP
            -- Insert question
            INSERT INTO lesson_questions (lesson_id, question_text, display_order)
            VALUES (
                v_new_lesson_id,
                v_question->>'question_text',
                COALESCE((v_question->>'display_order')::INTEGER, 0)
            )
            RETURNING id INTO v_question_id;

            -- Insert choices for this question
            IF v_question->'choices' IS NOT NULL THEN
                FOR v_choice IN SELECT * FROM jsonb_array_elements(v_question->'choices')
                LOOP
                    INSERT INTO question_choices (question_id, choice_text, is_correct, display_order)
                    VALUES (
                        v_question_id,
                        v_choice->>'choice_text',
                        COALESCE((v_choice->>'is_correct')::BOOLEAN, FALSE),
                        COALESCE((v_choice->>'display_order')::INTEGER, 0)
                    );
                END LOOP;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'lesson_id', v_new_lesson_id,
        'message', 'Lesson created successfully with all content',
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update lesson with all related content
CREATE OR REPLACE FUNCTION update_lesson_with_content(
    p_token VARCHAR,
    p_lesson_id BIGINT,
    p_title VARCHAR,
    p_description TEXT,
    p_content TEXT,
    p_category VARCHAR,
    p_status VARCHAR,
    p_summary TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_applications JSONB DEFAULT '[]'::jsonb,
    p_questions JSONB DEFAULT '[]'::jsonb,
    p_relevant_start_day INTEGER DEFAULT 1,
    p_relevant_end_day INTEGER DEFAULT 366,
    p_grade VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_user_role VARCHAR;
    v_app JSONB;
    v_question JSONB;
    v_choice JSONB;
    v_question_id BIGINT;
BEGIN
    -- Verify token and get user info
    SELECT user_id, user_role INTO v_user_id, v_user_role
    FROM verify_token(p_token);

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;

    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update lessons';
    END IF;

    -- Check if lesson exists
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE id = p_lesson_id) THEN
        RAISE EXCEPTION 'Lesson not found';
    END IF;

    -- Update lesson
    UPDATE lessons
    SET title = p_title,
        description = p_description,
        content = p_content,
        category = p_category,
        status = p_status,
        summary = p_summary,
        image_url = p_image_url,
        relevant_start_day = p_relevant_start_day,
        relevant_end_day = p_relevant_end_day,
        grade = p_grade
    WHERE id = p_lesson_id;

    -- Delete existing applications and questions
    DELETE FROM lesson_applications WHERE lesson_applications.lesson_id = p_lesson_id;
    DELETE FROM lesson_questions WHERE lesson_questions.lesson_id = p_lesson_id; -- This will cascade to choices

    -- Insert new applications if provided
    IF p_applications IS NOT NULL AND jsonb_array_length(p_applications) > 0 THEN
        FOR v_app IN SELECT * FROM jsonb_array_elements(p_applications)
        LOOP
            INSERT INTO lesson_applications (lesson_id, title, description, display_order)
            VALUES (
                p_lesson_id,
                v_app->>'title',
                v_app->>'description',
                COALESCE((v_app->>'display_order')::INTEGER, 0)
            );
        END LOOP;
    END IF;

    -- Insert new questions if provided
    IF p_questions IS NOT NULL AND jsonb_array_length(p_questions) > 0 THEN
        FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
        LOOP
            -- Insert question
            INSERT INTO lesson_questions (lesson_id, question_text, display_order)
            VALUES (
                p_lesson_id,
                v_question->>'question_text',
                COALESCE((v_question->>'display_order')::INTEGER, 0)
            )
            RETURNING id INTO v_question_id;

            -- Insert choices for this question
            IF v_question->'choices' IS NOT NULL THEN
                FOR v_choice IN SELECT * FROM jsonb_array_elements(v_question->'choices')
                LOOP
                    INSERT INTO question_choices (question_id, choice_text, is_correct, display_order)
                    VALUES (
                        v_question_id,
                        v_choice->>'choice_text',
                        COALESCE((v_choice->>'is_correct')::BOOLEAN, FALSE),
                        COALESCE((v_choice->>'display_order')::INTEGER, 0)
                    );
                END LOOP;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'lesson_id', p_lesson_id,
        'message', 'Lesson updated successfully with all content',
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get lesson with all related content
CREATE OR REPLACE FUNCTION get_lesson_with_content(
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
    relevant_start_day INTEGER,
    relevant_end_day INTEGER,
    grade VARCHAR,
    applications JSONB,
    questions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.title,
        l.description,
        l.content,
        l.category,
        l.status,
        l.created_by,
        l.created_at,
        l.summary,
        l.image_url,
        l.relevant_start_day,
        l.relevant_end_day,
        l.grade,
        -- Get applications as JSONB array
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', la.id,
                    'title', la.title,
                    'description', la.description,
                    'display_order', la.display_order
                ) ORDER BY la.display_order
            )
            FROM lesson_applications la
            WHERE la.lesson_id = p_lesson_id),
            '[]'::jsonb
        ) AS applications,
        -- Get questions with choices as JSONB array
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', lq.id,
                    'question_text', lq.question_text,
                    'display_order', lq.display_order,
                    'choices', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', qc.id,
                                'choice_text', qc.choice_text,
                                'is_correct', qc.is_correct,
                                'display_order', qc.display_order
                            ) ORDER BY qc.display_order
                        )
                        FROM question_choices qc
                        WHERE qc.question_id = lq.id
                    )
                ) ORDER BY lq.display_order
            )
            FROM lesson_questions lq
            WHERE lq.lesson_id = p_lesson_id),
            '[]'::jsonb
        ) AS questions
    FROM lessons l
    WHERE l.id = p_lesson_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all lessons with content (for listing)
CREATE OR REPLACE FUNCTION get_all_lessons_with_content()
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
    relevant_start_day INTEGER,
    relevant_end_day INTEGER,
    grade VARCHAR,
    applications JSONB,
    questions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.title,
        l.description,
        l.content,
        l.category,
        l.status,
        l.created_by,
        l.created_at,
        l.summary,
        l.image_url,
        l.relevant_start_day,
        l.relevant_end_day,
        l.grade,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', la.id,
                    'title', la.title,
                    'description', la.description,
                    'display_order', la.display_order
                ) ORDER BY la.display_order
            )
            FROM lesson_applications la
            WHERE la.lesson_id = l.id),
            '[]'::jsonb
        ) AS applications,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', lq.id,
                    'question_text', lq.question_text,
                    'display_order', lq.display_order,
                    'choices', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', qc.id,
                                'choice_text', qc.choice_text,
                                'is_correct', qc.is_correct,
                                'display_order', qc.display_order
                            ) ORDER BY qc.display_order
                        )
                        FROM question_choices qc
                        WHERE qc.question_id = lq.id
                    )
                ) ORDER BY lq.display_order
            )
            FROM lesson_questions lq
            WHERE lq.lesson_id = l.id),
            '[]'::jsonb
        ) AS questions
    FROM lessons l
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
