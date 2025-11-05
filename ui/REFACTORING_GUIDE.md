# React Router Refactoring Progress

## ✅ Completed

### Core Setup

- ✅ Installed `react-router-dom`
- ✅ Created `src/contexts/AuthContext.tsx` - Central state management for auth, users, lessons, and progress
- ✅ Created `src/hooks/useAuth.ts` - Custom hook to access auth context
- ✅ Created `src/components/auth/ProtectedRoute.tsx` - Route guard component
- ✅ Created `src/components/layout/RootLayout.tsx` - Wraps app with AuthProvider
- ✅ Created `src/components/layout/Layout.tsx` - Main layout with Header and Outlet
- ✅ Created `src/routes/index.tsx` - Centralized routing configuration
- ✅ Created `src/App-new.tsx` - New App component using RouterProvider
- ✅ Updated `src/components/layout/Header.tsx` - Now uses `useAuth()` and `useNavigate()`
- ✅ Updated `src/components/auth/Login.tsx` - Now uses `useAuth()` and `<Link>`

## 🔄 Components That Need Refactoring

The following components still have the old prop-based API and need to be updated to use:

- `useAuth()` hook instead of props
- `useNavigate()` instead of `onNavigate` callbacks
- `useParams()` for route parameters
- `<Link>` components instead of button click handlers

### Auth Components

1. **src/components/auth/Register.tsx**
    - Remove `onNavigate` prop
    - Add `import { Link, useNavigate } from 'react-router-dom'`
    - Replace buttons with `<Link to="/login">`
    - Auto-navigate after successful registration using `navigate('/login')`

2. **src/components/auth/ForgotPassword.tsx**
    - Remove `onNavigate` prop
    - Add `import { Link } from 'react-router-dom'`
    - Replace buttons with `<Link to="/login">`

### Dashboard Components

3. **src/components/dashboard/UserDashboard.tsx**
    - Remove all props: `currentUser`, `lessons`, `progress`, `onSelectLesson`, `onNavigate`
    - Add `const { currentUser, lessons, progress } = useAuth();`
    - Add `const navigate = useNavigate();`
    - Change `onSelectLesson(lesson)` to `navigate(/lessons/${lesson.id})`
    - Change `onNavigate('lessons')` to `navigate('/lessons')`

4. **src/components/dashboard/AdminDashboard.tsx**
    - Remove all props
    - Add `const { lessons, users, progress, deleteLesson } = useAuth();`
    - Add `const navigate = useNavigate();`
    - Change `onCreateLesson()` to `navigate('/lessons/create')`
    - Change `onEditLesson(lesson)` to `navigate(/lessons/${lesson.id}/edit)`
    - Change `onSelectLesson(lesson)` to `navigate(/lessons/${lesson.id})`
    - Change `onDeleteLesson(id)` to `deleteLesson(id)`

### Lesson Components

5. **src/components/lessons/LessonList.tsx**
    - Remove all props
    - Add `const { lessons, progress, currentUser } = useAuth();`
    - Add `const navigate = useNavigate();`
    - Change `onSelectLesson(lesson)` to `navigate(/lessons/${lesson.id})`
    - Change `onCreateLesson()` to `navigate('/lessons/create')`

6. **src/components/lessons/LessonDetail.tsx**
    - Remove all props
    - Add `const { id } = useParams();`
    - Add `const { lessons, currentUser, progress, updateProgress } = useAuth();`
    - Add `const navigate = useNavigate();`
    - Find lesson: `const lesson = lessons.find(l => l.id === id);`
    - Find progress: `const lessonProgress = progress.find(p => p.userId === currentUser.id && p.lessonId === id);`
    - Change `onBack()` to `navigate(-1)` or `navigate('/lessons')`
    - Change `onUpdateProgress(...)` to `updateProgress(...)`

7. **src/components/lessons/LessonEditor.tsx**
    - Remove all props
    - Add `const { id } = useParams();`
    - Add `const { lessons, createLesson, updateLesson } = useAuth();`
    - Add `const navigate = useNavigate();`
    - Find lesson if editing: `const lesson = id ? lessons.find(l => l.id === id) : undefined;`
    - Get categories: `const categories = Array.from(new Set(lessons.map(l => l.category)));`
    - Change `onSave(data)` to either `createLesson(data)` or `updateLesson(id, data)`
    - Change `onBack()` to `navigate(-1)`

## 📝 Final Steps

After refactoring all components:

1. **Replace App.tsx**:

    ```bash
    # Backup old App.tsx
    move src\App.tsx src\App.old.tsx
    # Use new App
    move src\App-new.tsx src\App.tsx
    ```

2. **Test the application**:
    - Login page should work
    - Protected routes should redirect to login
    - Admin routes should only be accessible by admin users
    - All navigation should work with browser back/forward buttons
    - URL should update as you navigate

## 🎯 Benefits of This Refactoring

1. **Better URL Management**: Each page has its own URL, shareable and bookmarkable
2. **Browser History**: Back/forward buttons work naturally
3. **Code Separation**: Auth logic centralized in AuthContext
4. **Type Safety**: TypeScript ensures correct usage of hooks
5. **Protected Routes**: Automatic authentication checks
6. **Admin Routes**: Role-based access control
7. **Cleaner Components**: No prop drilling, components get data from context

## 📚 Key Patterns

### Accessing Auth Data

```typescript
const { currentUser, lessons, progress, login, logout } = useAuth();
```

### Navigation

```typescript
const navigate = useNavigate();
navigate('/lessons');
navigate(`/lessons/${id}`);
navigate(-1); // Go back
```

### Route Parameters

```typescript
const { id } = useParams();
```

### Links

```tsx
<Link to="/dashboard">Dashboard</Link>
<Link to={`/lessons/${lesson.id}`}>View Lesson</Link>
```

### Protected Content

```tsx
<ProtectedRoute>
  <UserContent />
</ProtectedRoute>

<ProtectedRoute requireAdmin>
  <AdminContent />
</ProtectedRoute>
```
