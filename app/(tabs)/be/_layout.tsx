import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function BeLayout() {
  const commonOptions = {
    headerShown: false,
    headerShadowVisible: false,
    headerStyle: {
      
      backgroundColor: '#fff',
      
    },
  };

  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: '个人资料',
        }}
      />
      <Stack.Screen
        name="oath"
        options={{
          title: '我的约誓',
        }}
      />
      <Stack.Screen
        name="promise"
        options={{
          title: '我的承诺',
        }}
      />
      <Stack.Screen
        name="achievement"
        options={{
          title: '创造成果',
        }}
      />
    </Stack>
  );
}