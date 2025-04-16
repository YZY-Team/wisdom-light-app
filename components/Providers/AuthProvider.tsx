import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useIsLogin } from '~/queries/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: isLoggedIn, isLoading, error } = useIsLogin();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;


    // 未登录且不在登录页面，跳转到登录页
    // 处理 401 错误情况
    // if (!isLoggedIn && segments[0] !== 'login') {
    //   console.log('未登录且不在登录页面，跳转到登录页');
    //   router.replace('/(auth)/login');
    //   return;
    // }
    // if (isLoggedIn?.code === 401) {
    //   console.log('未登录或登录已过期，跳转到登录页');
    //   router.replace('/(auth)/login');
    //   return;
    // }

  }, [isLoggedIn, segments, isLoading, error]);

  return <>{children}</>;
}
