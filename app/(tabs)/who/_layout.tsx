import { Stack } from 'expo-router';
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: '我的',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          title: '通用设置',
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: '人工客服',
        }}
      />
      <Stack.Screen
        name="membership"
        options={{
          title: '会员充值',
        }}
      />
      <Stack.Screen
        name="become-mentor"
        options={{
          title: '成为导师',
        }}
      />
    </Stack>
  );
}