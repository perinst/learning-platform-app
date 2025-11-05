import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});

// Query keys
export const queryKeys = {
    auth: {
        currentUser: ['auth', 'currentUser'] as const,
        users: ['auth', 'users'] as const,
    },
    lessons: {
        all: ['lessons'] as const,
        detail: (id: string | number) => ['lessons', id] as const,
    },
    progress: {
        all: ['progress'] as const,
        byUser: (userId: string) => ['progress', 'user', userId] as const,
        byLesson: (userId: string, lessonId: string | number) =>
            ['progress', 'user', userId, 'lesson', lessonId] as const,
    },
} as const;
