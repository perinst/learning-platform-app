import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api';
import { queryKeys } from '../lib/queryClient';

export function useProgress() {
    return useQuery({
        queryKey: queryKeys.progress.all,
        queryFn: progressApi.getProgress,
    });
}

export function useUserProgress(userId: string) {
    return useQuery({
        queryKey: queryKeys.progress.byUser(userId),
        queryFn: () => progressApi.getUserProgress(userId),
        enabled: !!userId,
    });
}

export function useLessonProgress(userId: string, lessonId: string) {
    return useQuery({
        queryKey: queryKeys.progress.byLesson(userId, lessonId),
        queryFn: () => progressApi.getLessonProgress(userId, lessonId),
        enabled: !!userId && !!lessonId,
    });
}

export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            lessonId,
            progress,
            completed,
        }: {
            userId: string;
            lessonId: string;
            progress: number;
            completed: boolean;
        }) => progressApi.updateProgress(userId, lessonId, progress, completed),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.progress.byUser(variables.userId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.progress.byLesson(variables.userId, variables.lessonId),
            });
        },
    });
}

export function useMarkLessonAccessed() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, lessonId }: { userId: string; lessonId: string }) =>
            progressApi.markLessonAccessed(userId, lessonId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.progress.byUser(variables.userId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.progress.byLesson(variables.userId, variables.lessonId),
            });
        },
    });
}
