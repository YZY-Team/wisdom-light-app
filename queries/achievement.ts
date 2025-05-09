import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { achievementBookApi } from "~/api/be/achievementBook";

// 查询键常量
const QUERY_KEYS = {
  ACTIVE_ACHIEVEMENT_BOOK: 'activeAchievementBook',
  ACHIEVEMENT_BOOK: 'achievementBook',
  GOALS_BY_BOOK_ID: 'goalsByBookId',
} as const;

// 获取活跃的成就书
export const useActiveAchievementBook = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVE_ACHIEVEMENT_BOOK],
    queryFn: () => achievementBookApi.getActiveAchievementBook(),
  });
};

// 获取指定成就书
export const useAchievementBook = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACHIEVEMENT_BOOK, id],
    queryFn: () => achievementBookApi.getAchievementBook(id),
    enabled: !!id,
  });
};

// 获取指定成就书下的目标列表
export const useGoalsByBookId = (bookId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GOALS_BY_BOOK_ID, bookId],
    queryFn: () => achievementBookApi.getGoalsByBookId(bookId!),
    enabled: Boolean(bookId),
  });
};