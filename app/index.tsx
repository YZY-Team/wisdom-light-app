import { useRouter } from 'expo-router';
import * as React from 'react';
import { View,Text } from 'react-native';


export default function SplashScreen() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/be');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-center font-bold">
        My Expo App
      </Text>
    </View>
  );
}