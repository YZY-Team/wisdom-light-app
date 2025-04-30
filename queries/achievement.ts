import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { achievementBookApi } from "~/api/be/achievementBook";

// 查询键常量
const QUERY_KEYS = {
  ACTIVE_ACHIEVEMENT_BOOK: 'activeAchievementBook',
  ACHIEVEMENT_BOOK: 'achievementBook',
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