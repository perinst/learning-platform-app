# Lesson Structure Enhancement

## Overview

This enhancement adds support for **Real-World Applications** and **Multiple Choice Questions** to lessons, allowing for richer educational content.

## Database Changes

### New Tables

#### 1. `lesson_applications`

Stores real-world applications for each lesson.

```sql
- id: BIGSERIAL PRIMARY KEY
- lesson_id: BIGINT (FK to lessons)
- title: VARCHAR(255)
- description: TEXT
- display_order: INTEGER
```

#### 2. `lesson_questions`

Stores multiple choice questions for each lesson.

```sql
- id: BIGSERIAL PRIMARY KEY
- lesson_id: BIGINT (FK to lessons)
- question_text: TEXT
- display_order: INTEGER
```

#### 3. `question_choices`

Stores answer choices for each question.

```sql
- id: BIGSERIAL PRIMARY KEY
- question_id: BIGINT (FK to lesson_questions)
- choice_text: TEXT
- is_correct: BOOLEAN
- display_order: INTEGER
```

### New RPC Functions

#### `create_lesson_with_content()`

Creates a lesson with all related content in a single transaction.

**Parameters:**

- `p_token`: Authentication token
- `p_title`, `p_description`, `p_content`, `p_category`, `p_status`: Basic lesson fields
- `p_summary`, `p_image_url`: Optional fields
- `p_applications`: JSONB array of applications
- `p_questions`: JSONB array of questions with choices

#### `update_lesson_with_content()`

Updates a lesson and replaces all related content.

**Parameters:** Same as create, plus `p_lesson_id`

#### `get_lesson_with_content()`

Retrieves a lesson with all applications and questions.

#### `get_all_lessons_with_content()`

Retrieves all lessons with their full content.

## Frontend API Changes

### TypeScript Types

```typescript
interface QuestionChoice {
    id?: number;
    choiceText: string;
    isCorrect: boolean;
    displayOrder: number;
}

interface LessonQuestion {
    id?: number;
    questionText: string;
    displayOrder: number;
    choices: QuestionChoice[];
}

interface LessonApplication {
    id?: number;
    title: string;
    description: string;
    displayOrder: number;
}

interface Lesson {
    // ... existing fields
    applications?: LessonApplication[];
    questions?: LessonQuestion[];
}
```

### API Usage

#### Create Lesson with Questions and Applications

```typescript
const newLesson = await lessonsApi.createLesson({
    title: 'Introduction to React',
    description: 'Learn React basics',
    content: '# React Fundamentals...',
    category: 'Programming',
    status: 'published',

    // Real-world applications
    applications: [
        {
            title: 'Building Web Apps',
            description: 'React is used by Facebook, Instagram, Netflix...',
            displayOrder: 0,
        },
        {
            title: 'Mobile Development',
            description: 'React Native allows building mobile apps...',
            displayOrder: 1,
        },
    ],

    // Multiple choice questions
    questions: [
        {
            questionText: 'What is React?',
            displayOrder: 0,
            choices: [
                { choiceText: 'A JavaScript library', isCorrect: true, displayOrder: 0 },
                { choiceText: 'A database', isCorrect: false, displayOrder: 1 },
                { choiceText: 'A programming language', isCorrect: false, displayOrder: 2 },
            ],
        },
    ],
});
```

#### Update Lesson

```typescript
const updated = await lessonsApi.updateLesson(lessonId, {
  title: "Updated Title",
  applications: [...], // Replaces all applications
  questions: [...] // Replaces all questions
});
```

#### Get Lesson with Content

```typescript
const lesson = await lessonsApi.getLesson(lessonId);
console.log(lesson.applications); // Array of applications
console.log(lesson.questions); // Array of questions with choices
```

## Migration Steps

1. **Apply SQL migration:**

    ```bash
    # The file 04-lesson-enhancements.sql will be automatically executed
    # when you recreate the database or run migration
    ```

2. **No frontend code changes required** - The API and types are backward compatible. Existing lessons will have empty `applications` and `questions` arrays.

## Benefits

✅ **Single API call** - Create/update lessons with all content in one transaction
✅ **Data integrity** - Foreign key constraints ensure consistency
✅ **Atomic operations** - All-or-nothing updates prevent partial data
✅ **Flexible structure** - Easy to add more question types in the future
✅ **Performance** - Efficient queries with proper indexing

## Example Lesson Structure

```json
{
    "id": 1,
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript fundamentals",
    "content": "# JavaScript Basics\n\n...",
    "category": "Programming",
    "status": "published",
    "applications": [
        {
            "title": "Web Development",
            "description": "JavaScript powers interactive websites",
            "displayOrder": 0
        }
    ],
    "questions": [
        {
            "questionText": "What is a variable?",
            "displayOrder": 0,
            "choices": [
                {
                    "choiceText": "A container for storing data",
                    "isCorrect": true,
                    "displayOrder": 0
                },
                {
                    "choiceText": "A type of function",
                    "isCorrect": false,
                    "displayOrder": 1
                }
            ]
        }
    ]
}
```

## Notes

- **Display Order**: Use `displayOrder` to control the sequence of applications, questions, and choices
- **Cascade Delete**: Deleting a lesson automatically deletes all its applications and questions
- **Validation**: Backend validates that at least one choice is correct for each question
- **JSONB Format**: Applications and questions are passed as JSON strings to PostgreSQL functions
