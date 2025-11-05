import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import { queryKeys } from '../lib/queryClient';

export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.auth.currentUser,
        queryFn: authApi.getCurrentUser,
    });
}

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.auth.users,
        queryFn: authApi.getUsers,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.auth.currentUser, user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.setQueryData(queryKeys.auth.currentUser, null);
            queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
        },
    });
}
