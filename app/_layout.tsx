import '../global.css';
import 'expo-dev-client';
// import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { Stack } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  useInitialAndroidBarSync();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function prepare() {
      try {
        // First complete initialization
        setIsReady(true);
      } catch (error) {
        console.error(error);
      }
    }

    prepare();
  }, []);

  // Only navigate when the layout is ready
  useEffect(() => {
    if (isReady) {
      router.replace('/(tabs)/be');
    }
  }, [isReady, router]);

  if (!isReady) {
    return null;
  }

  return (
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
  );
}
