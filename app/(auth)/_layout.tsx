import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

// 模拟身份验证状态
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 这里可以添加实际的身份验证检查逻辑
    const checkAuth = async () => {
      // 从存储中获取token或其他验证信息
      const isAuth = false; // 默认未登录状态
      setIsAuthenticated(isAuth);
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
};

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // 身份验证状态未确定时显示加载状态
  if (isAuthenticated === null) {
    return null;
  }

  // 已登录用户重定向到主页面
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}