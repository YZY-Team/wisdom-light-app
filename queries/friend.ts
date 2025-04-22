import { useQuery } from '@tanstack/react-query';
import { friendApi } from '~/api/have/friend';

export const useFriendList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['friendList'],
    queryFn: friendApi.getFriends,
  });
  return { data, isLoading, error };
};
