import { useRouter } from 'expo-router';
import * as React from 'react';
import { View, Text } from 'react-native';
import { useIsLogin } from '~/queries/auth';

export default function SplashScreen() {
  const router = useRouter();
  const { data: isLoggedIn, isLoading } = useIsLogin();

  React.useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.replace('/(tabs)/be');
      } else {
        router.replace('/(auth)/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, isLoggedIn, isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-center font-bold">
        My Expo App
      </Text>
    </View>
  );
}