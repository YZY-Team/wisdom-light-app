import '../global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from '~/contexts/WebSocketContext';
export { ErrorBoundary } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '~/contexts/DatabaseContext';
import { useDatabase } from '~/contexts/DatabaseContext';

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
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <KeyboardProvider>
            <DrizzleStudioComponent />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
              }}
            />
          </KeyboardProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
