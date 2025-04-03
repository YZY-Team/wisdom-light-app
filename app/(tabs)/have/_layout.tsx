import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function HaveLayout() {
  const commonOptions = {
    headerShown: false,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: '#fff',
    },
  };

  return (
    <Stack screenOptions={
        {headerShown: false}
    }>
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