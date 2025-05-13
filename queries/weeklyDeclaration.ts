import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';

// Query Keys
export const weeklyDeclarationKeys = {
  all: ['weeklyDeclaration'] as const,
  lists: () => [...weeklyDeclarationKeys.all, 'list'] as const,
  list: (bookId: string) => [...weeklyDeclarationKeys.lists(), bookId] as const,
  current: (bookId: string) => [...weeklyDeclarationKeys.all, 'current', bookId] as const,
};

// Queries
export const useWeeklyDeclarationList = (bookId: string) => {
  return useQuery({
    queryKey: weeklyDeclarationKeys.list(bookId),
    queryFn: async () => {
      const response = await weeklyDeclarationApi.getWeeklyDeclarationList(bookId);
      if (response.code === 200) {
        return response.data.reverse();
      }
      throw new Error('获取周宣告列表失败');
    },
  });
};

export const useCurrentWeeklyDeclaration = (bookId: string) => {
  return useQuery({
    queryKey: weeklyDeclarationKeys.current(bookId),
    queryFn: async () => {
      if (!bookId) throw new Error('BookId is required');
      const response = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(bookId);
      if (response.code === 200) {
        return response.data;
      }
      return null;
    },
    enabled: !!bookId,
  });
};

// Mutations
export const useCreateWeeklyDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDeclaration: WeeklyDeclarationDTO) => {
      const response = await weeklyDeclarationApi.createWeeklyDeclaration(newDeclaration);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error('创建周宣告失败');
    },
    onSuccess: (data, variables) => {
      // 更新列表和当前周宣告的缓存
      queryClient.invalidateQueries({
        queryKey: weeklyDeclarationKeys.list(variables.bookId),
      });
      queryClient.invalidateQueries({
        queryKey: weeklyDeclarationKeys.current(variables.bookId),
      });
    },
  });
};

export const useUpdateWeeklyDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, declaration }: { id: string; declaration: WeeklyDeclarationDTO }) => {
      const response = await weeklyDeclarationApi.updateWeeklyDeclaration(id, declaration);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error('更新周宣告失败');
    },
    onSuccess: (data, variables) => {
      // 更新列表和当前周宣告的缓存
      queryClient.invalidateQueries({
        queryKey: weeklyDeclarationKeys.list(variables.declaration.bookId),
      });
      queryClient.invalidateQueries({
        queryKey: weeklyDeclarationKeys.current(variables.declaration.bookId),
      });
    },
  });
};