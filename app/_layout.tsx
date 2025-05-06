import '../global.css';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocketContext, WebSocketProvider } from '~/contexts/WebSocketContext';
export { ErrorBoundary } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '~/contexts/DatabaseContext';
import { useDatabase } from '~/contexts/DatabaseContext';
import * as React from 'react';
import { useIsLogin } from '~/queries/auth';

import { WebRTCProvider } from '~/contexts/WebRTCContext';
import { loginApi } from '~/api/auth/login';
import { useUserStore } from '~/store/userStore';
import { ClientProvider } from '~/components/Providers/ClientProvider';
import WebRTCDialog from '~/components/WebRtcDialog';
import { useWebRTC } from '~/contexts/WebRTCContext';

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

// WebRTC对话框包装组件
const WebRTCDialogWrapper = () => {
  const { isCallModalVisible, callerInfo, hideCallModal } = useWebRTC();
  
  return (
    <WebRTCDialog
      visible={isCallModalVisible}
      onClose={hideCallModal}
      callerName={callerInfo?.name || '未知用户'}
      callerId={callerInfo?.id || ''}
    />
  );
};

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <WebRTCProvider>
          <WebSocketProvider>
            <KeyboardProvider>
              <ClientProvider>
                <>
                  <DrizzleStudioComponent />
                  <WebRTCDialogWrapper />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'none',
                    }}
                  />
                </>
              </ClientProvider>
            </KeyboardProvider>
          </WebSocketProvider>
        </WebRTCProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
