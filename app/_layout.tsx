import '../global.css';
import 'expo-dev-client';
import { useInitialAndroidBarSync } from '~/lib/useColorScheme';

import { Slot, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { WebSocketProvider } from '~/contexts/WebSocketContext';
import { loginApi } from '~/api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('');
  useInitialAndroidBarSync();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const res = await loginApi.isLogin();
            if (res.code === 200) {
              setInitialRoute('/(tabs)/be');
              setIsReady(true);
              return;
            }
          } catch (error) {
            console.error('检查登录状态失败:', error);
            await AsyncStorage.removeItem('token');
          }
        }
        setInitialRoute('/(auth)/login');
        setIsReady(true);
      } catch (error) {
        console.error(error);
        setInitialRoute('/(auth)/login');
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && initialRoute) {
      router.replace(initialRoute);
    }
  }, [isReady, initialRoute, router]);

  if (!isReady) {
    return null;
  }

  return (
    <WebSocketProvider>
      <View style={{
        flex: 1,
        paddingTop: insets.top,
      }}>
        <Slot />
      </View>
    </WebSocketProvider>
  );
}
