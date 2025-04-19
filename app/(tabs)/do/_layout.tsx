import { Stack } from 'expo-router';

export default function Layout() {
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
          title: '智慧之光',
        }}
      />
      {/* <Stack.Screen
        name="[id]"
        options={{
          title: '详情',
        }}
      /> */}

    </Stack>
  );
}