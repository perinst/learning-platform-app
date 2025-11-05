import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi } from '../api';
import { queryKeys } from '../lib/queryClient';
import type { Lesson } from '../utils/mockData';

export function useLessons() {
    return useQuery({
        queryKey: queryKeys.lessons.all,
        queryFn: lessonsApi.getLessons,
    });
}

export function useLesson(id: string | number) {
    return useQuery({
        queryKey: queryKeys.lessons.detail(id),
        queryFn: () => lessonsApi.getLesson(id),
        enabled: !!id,
    });
}

export function useCreateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data }: { data: Omit<Lesson, 'id' | 'createdAt' | 'createdBy'> }) =>
            lessonsApi.createLesson(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
        },
    });
}

export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Lesson> }) => lessonsApi.updateLesson(id, data),
        onSuccess: (updatedLesson) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.setQueryData(queryKeys.lessons.detail(updatedLesson.id), updatedLesson);
        },
    });
}

export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => lessonsApi.deleteLesson(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.removeQueries({ queryKey: queryKeys.lessons.detail(deletedId) });
            // Also clean up related progress
            queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
        },
    });
}
