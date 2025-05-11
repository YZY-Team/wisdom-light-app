import { ActivityIndicator, View } from 'react-native';

export function LoadingSpinner() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#1483FD" />
    </View>
  );
} 