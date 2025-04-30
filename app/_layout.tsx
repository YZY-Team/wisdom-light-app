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
import { loginApi } from '~/api/auth/login';
import { useUserStore } from '~/store/userStore';

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



export default function RootLayout() {
  const userInfo=useUserStore(sorte=>sorte.userInfo)
  const router=useRouter()
  React.useEffect(()=>{
    if(userInfo){
      router.replace('/(tabs)/be')
    }else{
      router.replace('/(auth)/login')
    }
  },[userInfo])
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <WebRTCProvider>
          <WebSocketProvider>
            <KeyboardProvider>
              <>
                <DrizzleStudioComponent />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'none',
                  }}
                />
              </>
            </KeyboardProvider>
          </WebSocketProvider>
        </WebRTCProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
