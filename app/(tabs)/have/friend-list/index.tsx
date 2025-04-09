import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { router } from 'expo-router';

export default function FriendList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取好友列表
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendApi.getFriends();
        setFriends(response.data);
      } catch (error) {
        console.error('获取好友列表失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* 搜索栏 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">好友列表</Text>
      </View>

      {/* 好友列表 */}
      <ScrollView className="flex-1">
        {friends.map((friend) => (
          <Pressable
            key={friend.userId}
            className="flex-row items-center border-b border-gray-100 px-4 py-3">
            <Image
              source={{
                uri: friend.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
              }}
              className="h-12 w-12 rounded-full"
              contentFit="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium">
                {friend.remark || friend.nickname || friend.username}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">好友</Text>
            </View>
            <Text className="text-sm text-gray-400">
              {new Date(friend.createTime).toLocaleDateString()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
