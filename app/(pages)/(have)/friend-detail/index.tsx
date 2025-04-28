import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import type { Friend } from '~/types/have/friendType';
import { cssInterop } from 'nativewind';
import { dialogApi } from '~/api/have/dialog';
import { useUserStore } from '~/store/userStore';

cssInterop(Image, { className: 'style' });

export default function FriendDetailPage() {
  const params = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // 从路由参数中获取好友信息
    if (params.friendInfo) {
      try {
        const friendData = JSON.parse(params.friendInfo as string) as Friend;
        setFriend(friendData);
      } catch (error) {
        console.error('解析好友信息失败', error);
      }
    }
  }, [params.friendInfo]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!friend) return;
    const { username } = friend;
    try {
      setLoading(true);
      // 调用创建私聊API，获取对话ID
      const dialogId = await dialogApi.createDialog(friend.userId);

      // 跳转到聊天页面
      router.push({
        pathname: `/private-chat/${dialogId.data}`,
        params: { userName: username, dialogId: dialogId.data, targetUserId: friend.userId },
      });
    } catch (error) {
      console.error('创建私聊失败', error);
    } finally {
      setLoading(false);
    }
  };

  if (!friend) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* 头部导航 */}
      <View className="relative flex-row items-center justify-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="absolute bottom-0 left-4 top-0 z-10 justify-center">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="text-center text-lg font-medium">好友详情</Text>
      </View>

      {/* 好友信息 */}
      <ScrollView className="flex-1 px-4">
        <View className="items-center py-6">
          <Image
            source={{ uri: friend.avatarUrl }}
            className="h-20 w-20 rounded-full"
            contentFit="cover"
          />
          <Text className="mt-4 text-xl font-bold">{friend.nickname || friend.username}</Text>
          {friend.remark && <Text className="mt-1 text-gray-500">备注: {friend.remark}</Text>}
        </View>

        {/* 好友详细信息 */}
        <View className="mb-4 rounded-lg bg-gray-50 p-4">
          <View className="flex-row items-center border-b border-gray-100 py-2">
            <Text className="w-24 text-gray-500">用户ID</Text>
            <Text>{friend.userId}</Text>
          </View>
          <View className="flex-row items-center py-2">
            <Text className="w-24 text-gray-500">用户名</Text>
            <Text>{friend.username}</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <Pressable
          className="mb-4 items-center rounded-lg bg-blue-500 py-3"
          onPress={handleSendMessage}
          disabled={loading}>
          <Text className="font-medium text-white">{loading ? '处理中...' : '发送消息'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
