import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';

export default function BeLayout() {
  const commonOptions: NativeStackNavigationOptions = {
    headerShown: false,
    headerShadowVisible: false,
  };

  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
