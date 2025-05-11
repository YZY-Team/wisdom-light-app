import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyDeclarationApi } from '~/api/be/dailyDeclaration';
import { NewDailyDeclarationDTO } from '~/types/be/declarationType';

// 查询键常量
const QUERY_KEYS = {
  TODAY_DECLARATION: 'todayDeclaration',
  BOOK_DECLARATIONS: 'bookDeclarations',
  DECLARATION_DETAIL: 'declarationDetail',
} as const;

// 获取今
export const useTodayDeclaration = (bookId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TODAY_DECLARATION, bookId],
    queryFn: () => dailyDeclarationApi.getTodayDailyDeclaration(bookId),
  });
};

// 获取成就书的所有日宣告
export const useBookDeclarations = (bookId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOK_DECLARATIONS, bookId],
    queryFn: () => dailyDeclarationApi.getBookDailyDeclarations(bookId),
  });
};

// 获取日宣告详情
export const useDeclarationDetail = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DECLARATION_DETAIL, id],
    queryFn: () => dailyDeclarationApi.getNewDailyDeclarationDetail(id),
    enabled: !!id,
  });
};

// 创建新日宣告
export const useCreateDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewDailyDeclarationDTO) =>
      dailyDeclarationApi.createNewDailyDeclaration(data),
    onSuccess: (_, variables) => {
      // 创建成功后，使相关查询失效
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODAY_DECLARATION, variables.bookId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOK_DECLARATIONS, variables.bookId],
      });
    },
  });
};

// 更新日宣告
export const useUpdateDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewDailyDeclarationDTO }) =>
      dailyDeclarationApi.updateNewDailyDeclaration(id, data),
    onSuccess: (_, variables) => {
      // 更新成功后，使相关查询失效
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DECLARATION_DETAIL, variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODAY_DECLARATION, variables.data.bookId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOK_DECLARATIONS, variables.data.bookId],
      });
    },
  });
};