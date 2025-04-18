import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function HaveLayout() {
  const commonOptions = {
    headerShown: false,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: '#fff',
    },
    onTransitionStart: () => {
      console.time('页面切换动画耗时');
    },
    onTransitionEnd: () => {
      console.timeEnd('页面切换动画耗时');
    },
  };

  return (
    <Stack screenOptions={{
      headerShown: false,// 动画时长设为 0
      // animation: 'none',
    }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-friend/index"
        options={{
          title: '添加好友',
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="create-group/index"
        options={{
          title: '发起群聊',
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="chat-square/index"
        options={{
          title: '聊天广场',
          ...commonOptions,
        }}
      />
      {/* 添加私聊页面路由 */}
      <Stack.Screen
        name="private-chat/[userId]/index"
        options={{
          title: '私聊',
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="video-meeting/index"
        options={{
          title: '视频会议',
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="find-support/index"
        options={{
          title: '寻找支持',
          ...commonOptions,
        }}
      />
    </Stack>
  );
}