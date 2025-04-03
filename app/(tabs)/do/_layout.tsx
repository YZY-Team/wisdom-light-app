import { Stack } from 'expo-router';

export default function DoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '学习中心',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
            // headerShown: true,
          title: '视频教程',
        }}
      />
    </Stack>
  );
}