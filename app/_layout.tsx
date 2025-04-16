import '../global.css';
import 'expo-dev-client';
import { useInitialAndroidBarSync } from '~/lib/useColorScheme';

import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { WebSocketProvider } from '~/contexts/WebSocketContext';
import { loginApi } from '~/api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { useIsLogin } from '~/queries/auth';
import { AuthProvider } from '~/components/Providers/AuthProvider';

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}
