import { useQuery } from '@tanstack/react-query';
import { loginApi } from '~/api/auth/login';

export const useIsLogin = () => {
  return useQuery({
    queryKey: ['auth', 'isLogin'],
    queryFn: () => loginApi.isLogin(),
  });
};