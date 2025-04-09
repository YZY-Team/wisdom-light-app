import '../global.css';
import 'expo-dev-client';
// import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { Stack } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { WebSocketProvider } from '~/contexts/WebSocketContext';
import * as SecureStore from 'expo-secure-store';
import { loginApi } from '~/api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 删除 SecureStore import
// import * as SecureStore from 'expo-secure-store';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  useInitialAndroidBarSync();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function prepare() {
      try {
        setIsReady(true);
      } catch (error) {
        console.error(error);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      if (!isReady) return;
      
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const res = await loginApi.isLogin();
            if (res.code === 200) {
              router.replace('/(tabs)/be');
              return;
            }
          } catch (error) {
            console.error('检查登录状态失败:', error);
            await AsyncStorage.removeItem('token');
          }
        }
        router.replace('/(auth)/login');
      } catch (error) {
        console.error(error);
      }
    }

    checkAuth();
  }, [isReady, router]);

  if (!isReady) {
    return null;
  }

  return (
    <WebSocketProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: 'none',
          headerTitleStyle: {
            fontSize: 18,
          },
          contentStyle: {
            // paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingTop: insets.top,
          },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </WebSocketProvider>
  );
}
