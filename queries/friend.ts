import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendApi } from '~/api/have/friend';
import { FindFriend } from '~/types/have/friendType';

// 获取好友列表
export const useFriendList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['friendList'],
    queryFn: friendApi.getFriends,
  });
  return { data, isLoading, error };
};

// 获取好友详情
export const useFriendDetail = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['friendDetail', id],
    queryFn: () => friendApi.getFriend(id),
  });
  return { data, isLoading, error };
};
// 获取待处理的好友请求
export const usePendingRequests = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: friendApi.getPendingRequests,
  });
  return {
    pendingRequests: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};

// 发送好友请求
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendApi.sendRequest,
    onSuccess: () => {
      // 成功后可能需要更新已发送请求的缓存
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
    },
  });
};

// 接受好友请求
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendApi.acceptRequest,
    onSuccess: () => {
      // 成功后需要更新待处理请求和好友列表缓存
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friendList'] });
    },
  });
};

// 搜索好友
export const useFindFriends = (username: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['findFriends', username],
    queryFn: () => friendApi.findFriends(username),
    enabled: !!username.trim(), // 只有当用户名不为空时才执行查询
  });

  // 处理结果并进行类型转换
  const processResults = (): FindFriend[] => {
    if (!data?.data) return [];
    // 处理数组情况
    if (Array.isArray(data.data)) {
      // API 实际返回的是 FindFriend 对象，这里需要类型适配
      return data.data.filter(Boolean) as unknown as FindFriend[];
    }
    // 处理单个对象情况
    return data.data ? ([data.data].filter(Boolean) as unknown as FindFriend[]) : [];
  };

  return {
    searchResults: processResults(),
    isLoading,
    error,
    refetch,
  };
};
