import '../global.css';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from '~/contexts/WebSocketContext';
export { ErrorBoundary } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '~/contexts/DatabaseContext';
import { useDatabase } from '~/contexts/DatabaseContext';
import * as React from 'react';
import { useIsLogin } from '~/queries/auth';
import WebRTCDialog, { WebRtcDialog } from '~/components/WebRtcDialog';
import { WebRTCProvider } from '~/contexts/WebRTCContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// DrizzleStudio组件
const DrizzleStudioComponent = () => {
  const { useDrizzleStudio, isInitialized } = useDatabase();

  // 始终调用hook，但只在初始化后才会有效果
  const studioInstance = useDrizzleStudio();

  return studioInstance;
};

// 路由检查组件
function RouteGuard() {
  const router = useRouter();
  const { data: isLoggedIn, isLoading } = useIsLogin();

  React.useEffect(() => {
    if (isLoading) return;

    // 不使用window.location.pathname，直接跳转到对应页面
    if (isLoggedIn?.code === 200) {
      router.replace('/(tabs)/be');
    } else {
      router.replace('/(auth)/login');
    }
  }, [router, isLoggedIn, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
      <WebRTCProvider>
        <WebSocketProvider>
          <KeyboardProvider>
            <DrizzleStudioComponent />
            <RouteGuard />
            
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
          
          </KeyboardProvider>
        </WebSocketProvider>
        </WebRTCProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
