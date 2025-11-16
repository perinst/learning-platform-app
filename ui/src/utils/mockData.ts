export interface User {
    id: string;
    email: string;
    password?: string; // Optional - not returned from API, only used for mock login
    name: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

export interface QuestionChoice {
    id?: number;
    choiceText: string;
    isCorrect: boolean;
    displayOrder: number;
}

export interface LessonQuestion {
    id?: number;
    questionText: string;
    displayOrder: number;
    choices: QuestionChoice[];
}

export interface LessonApplication {
    id?: number;
    title: string;
    description: string;
    displayOrder: number;
}

export interface Lesson {
    id: number;
    title: string;
    description: string;
    content: string;
    category: string;
    status: 'draft' | 'published';
    createdBy: string;
    createdAt: Date;
    summary?: string;
    imageUrl?: string;
    applications?: LessonApplication[];
    questions?: LessonQuestion[];
    relevantStartDay?: number; // Day of year (1-366) when lesson becomes relevant
    relevantEndDay?: number; // Day of year (1-366) when lesson relevance ends
    grade?: string; // Grade level (e.g., '10', '11', '12' or custom values)
}

export interface Progress {
    userId: string;
    lessonId: number;
    completed: boolean;
    lastAccessed: Date;
    progress: number;
}

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatHistory {
    userId: string;
    lessonId: number;
    messages: ChatMessage[];
}

// Mock users
export const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        email: 'user@example.com',
        password: 'user123',
        name: 'John Doe',
        role: 'user',
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '3',
        email: 'jane@example.com',
        password: 'user123',
        name: 'Jane Smith',
        role: 'user',
        createdAt: new Date('2024-02-01'),
    },
];

// Mock lessons
export const mockLessons: Lesson[] = [
    {
        id: 1,
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React and component-based architecture',
        content: `# Introduction to React

React is a popular JavaScript library for building user interfaces, particularly single-page applications. It was developed by Facebook and is maintained by Facebook and a community of individual developers and companies.

## Key Concepts

### Components
Components are the building blocks of React applications. They are reusable pieces of code that return HTML elements.

### JSX
JSX is a syntax extension for JavaScript that looks similar to HTML. It makes it easier to write and understand the structure of your UI.

### Props
Props (properties) are how you pass data from parent components to child components.

### State
State is data that changes over time in your component. When state changes, React re-renders the component.

## Getting Started

To create a React component:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## Virtual DOM

React uses a Virtual DOM to optimize rendering. Instead of updating the entire DOM, React calculates the minimal changes needed and updates only those parts.`,
        category: 'Web Development',
        status: 'published',
        createdBy: '1',
        createdAt: new Date('2024-01-10'),
        summary:
            'This lesson covers the fundamentals of React including components, JSX, props, state, and the Virtual DOM. Perfect for beginners starting their React journey.',
        imageUrl:
            'https://images.unsplash.com/photo-1569693799105-4eb645d89aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBsYXB0b3B8ZW58MXx8fHwxNzYwMDYzODc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
        id: 2,
        title: 'TypeScript Basics',
        description: 'Master TypeScript fundamentals and type system',
        content: `# TypeScript Basics

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing to the language, which can help catch errors early and improve code quality.

## Why TypeScript?

- **Type Safety**: Catch errors at compile time instead of runtime
- **Better IDE Support**: Improved autocomplete and refactoring
- **Enhanced Readability**: Types serve as documentation
- **Scalability**: Better for large codebases

## Basic Types

### Primitive Types
\`\`\`typescript
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
\`\`\`

### Arrays
\`\`\`typescript
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
\`\`\`

### Interfaces
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}
\`\`\`

## Functions

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\``,
        category: 'Programming',
        status: 'published',
        createdBy: '1',
        createdAt: new Date('2024-01-15'),
        summary:
            'Learn TypeScript fundamentals including types, interfaces, and how to write type-safe code. Understand why TypeScript is essential for modern JavaScript development.',
        imageUrl:
            'https://images.unsplash.com/photo-1569693799105-4eb645d89aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBsYXB0b3B8ZW58MXx8fHwxNzYwMDYzODc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
        id: 3,
        title: 'CSS Flexbox Layout',
        description: 'Understanding modern CSS layouts with Flexbox',
        content: `# CSS Flexbox Layout

Flexbox is a one-dimensional layout method for arranging items in rows or columns. It makes it easier to design flexible responsive layout structures.

## Flex Container Properties

### display: flex
Start using flexbox by setting display to flex on the container.

\`\`\`css
.container {
  display: flex;
}
\`\`\`

### flex-direction
Controls the direction of flex items.

- row (default)
- row-reverse
- column
- column-reverse

### justify-content
Aligns items along the main axis.

- flex-start
- flex-end
- center
- space-between
- space-around
- space-evenly

### align-items
Aligns items along the cross axis.

- stretch (default)
- flex-start
- flex-end
- center
- baseline

## Flex Item Properties

### flex-grow
Defines the ability for a flex item to grow.

### flex-shrink
Defines the ability for a flex item to shrink.

### flex-basis
Defines the default size of an element.`,
        category: 'Web Development',
        status: 'published',
        createdBy: '1',
        createdAt: new Date('2024-01-20'),
        summary:
            'Master CSS Flexbox to create responsive and flexible layouts. Learn container and item properties, alignment, and practical use cases.',
        imageUrl:
            'https://images.unsplash.com/photo-1639396104908-a8f2037ad565?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGJvb2tzJTIwZGVza3xlbnwxfHx8fDE3NjAwNzM5NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
        id: 4,
        title: 'JavaScript Async/Await',
        description: 'Modern asynchronous programming in JavaScript',
        content: `# JavaScript Async/Await

Async/await is modern syntax for handling asynchronous operations in JavaScript. It makes asynchronous code look and behave more like synchronous code.

## Promises Review

Before async/await, we used Promises:

\`\`\`javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

## Async/Await Syntax

The same code with async/await:

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## Key Points

1. **async** keyword makes a function return a Promise
2. **await** keyword pauses execution until Promise resolves
3. Must use try/catch for error handling
4. Can only use await inside async functions

## Parallel Execution

\`\`\`javascript
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
\`\`\``,
        category: 'Programming',
        status: 'published',
        createdBy: '1',
        createdAt: new Date('2024-02-01'),
        summary:
            'Learn how to write clean asynchronous JavaScript code using async/await. Understand Promises, error handling, and parallel execution patterns.',
        imageUrl:
            'https://images.unsplash.com/photo-1569693799105-4eb645d89aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBsYXB0b3B8ZW58MXx8fHwxNzYwMDYzODc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
        id: 5,
        title: 'Git Version Control',
        description: 'Essential Git commands and workflows',
        content: `# Git Version Control

Git is a distributed version control system that helps you track changes in your code and collaborate with others.

## Basic Commands

### Initialize Repository
\`\`\`bash
git init
\`\`\`

### Clone Repository
\`\`\`bash
git clone <repository-url>
\`\`\`

### Check Status
\`\`\`bash
git status
\`\`\`

### Stage Changes
\`\`\`bash
git add .
git add <filename>
\`\`\`

### Commit Changes
\`\`\`bash
git commit -m "Commit message"
\`\`\`

### Push Changes
\`\`\`bash
git push origin main
\`\`\`

## Branching

### Create Branch
\`\`\`bash
git branch <branch-name>
\`\`\`

### Switch Branch
\`\`\`bash
git checkout <branch-name>
git switch <branch-name>
\`\`\`

### Create and Switch
\`\`\`bash
git checkout -b <branch-name>
\`\`\`

### Merge Branch
\`\`\`bash
git merge <branch-name>
\`\`\`

## Best Practices

1. Commit often with meaningful messages
2. Pull before pushing
3. Use branches for features
4. Review changes before committing`,
        category: 'Development Tools',
        status: 'published',
        createdBy: '1',
        createdAt: new Date('2024-02-05'),
        summary:
            'Get started with Git version control. Learn essential commands, branching strategies, and best practices for managing your code.',
        imageUrl:
            'https://images.unsplash.com/photo-1608986596619-eb50cc56831f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NjAwNjM4Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
        id: 6,
        title: 'REST API Design',
        description: 'Best practices for designing RESTful APIs',
        content: `# REST API Design

REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP requests to perform CRUD operations.

## HTTP Methods

### GET
Retrieve data from server
\`\`\`
GET /api/users
GET /api/users/123
\`\`\`

### POST
Create new resource
\`\`\`
POST /api/users
Body: { "name": "John", "email": "john@example.com" }
\`\`\`

### PUT
Update entire resource
\`\`\`
PUT /api/users/123
Body: { "name": "John Doe", "email": "john@example.com" }
\`\`\`

### PATCH
Partial update
\`\`\`
PATCH /api/users/123
Body: { "email": "newemail@example.com" }
\`\`\`

### DELETE
Remove resource
\`\`\`
DELETE /api/users/123
\`\`\`

## Status Codes

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Best Practices

1. Use nouns for endpoints, not verbs
2. Use proper HTTP methods
3. Return appropriate status codes
4. Version your API
5. Use filtering, sorting, pagination`,
        category: 'Backend Development',
        status: 'draft',
        createdBy: '1',
        createdAt: new Date('2024-02-10'),
        summary:
            'Learn how to design clean and efficient RESTful APIs. Understand HTTP methods, status codes, and industry best practices.',
        imageUrl:
            'https://images.unsplash.com/photo-1608986596619-eb50cc56831f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NjAwNjM4Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
];

// Mock progress data
export const mockProgress: Progress[] = [
    {
        userId: '2',
        lessonId: 1,
        completed: true,
        lastAccessed: new Date('2024-02-15'),
        progress: 100,
    },
    {
        userId: '2',
        lessonId: 2,
        completed: false,
        lastAccessed: new Date('2024-02-20'),
        progress: 60,
    },
    {
        userId: '2',
        lessonId: 3,
        completed: false,
        lastAccessed: new Date('2024-02-18'),
        progress: 30,
    },
];
