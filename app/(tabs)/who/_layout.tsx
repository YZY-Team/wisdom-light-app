import { Stack } from 'expo-router';
import Animated, { Easing } from 'react-native-reanimated';

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen 
        name="index" 
        options={{
          animation: 'none',
          title: '我的',
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          title: '通用设置', // 显示导航栏
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
