import '../global.css';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocketContext, WebSocketProvider } from '~/contexts/WebSocketContext';
export { ErrorBoundary } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '~/contexts/DatabaseContext';
import { useDatabase } from '~/contexts/DatabaseContext';
import * as React from 'react';
import { WebRTCProvider } from '~/contexts/WebRTCContext';
import { ClientProvider } from '~/components/Providers/ClientProvider';
import { registerApp, sendAuthRequest } from 'expo-native-wechat';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// DrizzleStudio组件
// const DrizzleStudioComponent = () => {

//   const { useDrizzleStudio, isInitialized } = useDatabase();
//   // 始终调用hook，但只在初始化后才会有效果
//   const studioInstance = useDrizzleStudio();

//   return studioInstance;
// };

export default function RootLayout() {
  React.useEffect(() => {
    registerApp({ appid: 'wx5544421face5824b' });
  }, []);
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <WebRTCProvider>
          <WebSocketProvider>
            <KeyboardProvider>
              <ClientProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'none',
                  }}
                />
              </ClientProvider>
            </KeyboardProvider>
          </WebSocketProvider>
        </WebRTCProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
