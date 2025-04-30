import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { dialogApi } from '~/api/have/dialog';
import { Dialog } from '~/types/have/dialogType';
import defaultAvatar from '~/assets/default-avatar.png';
import { Ionicons } from '@expo/vector-icons';

type GroupMember = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  isOnline?: boolean;
};

interface GroupMembersResponse {
  data: GroupMember[];
}

export default function GroupInfo() {
  const params = useLocalSearchParams();
  const { groupId, groupName } = params;
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupMembers = useCallback(async () => {
    try {
      const response = (await dialogApi.getGroupMembers(
        groupId as string
      )) as GroupMembersResponse;
      setMembers(response.data);
    } catch (error) {
      console.error('获取群成员失败:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupMembers();
  }, [fetchGroupMembers]);

  // 处理添加群成员
  const handleAddMembers = async (selectedMembers: string[]) => {
    try {
      await dialogApi.addGroupMembers(groupId as string, selectedMembers);
      
      // 重新获取群成员列表
      fetchGroupMembers();
    } catch (error) {
      console.error('添加群成员失败:', error);
    }
  };

  // 监听路由参数变化
  useEffect(() => {
    if (params.selectedMembers) {
      console.log('params.selectedMembers', params.selectedMembers);
      const selectedMembers = JSON.parse(params.selectedMembers as string);
      handleAddMembers(selectedMembers);
      // 清除参数
      router.setParams({});
    }
  }, [params.selectedMembers]);

  return (
    <View className="flex-1 bg-gray-100">
      {/* 顶部导航栏 */}
      {/* 头部导航 */}
      <View className="relative flex-row items-center justify-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="absolute bottom-0 left-4 top-0 z-10 justify-center">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="text-center text-lg font-medium">聊天信息({members.length})</Text>
      </View>

      <ScrollView className="flex-1">
        {/* 群名称 */}
        <TouchableOpacity className="mt-2 flex-row items-center justify-between bg-white px-4 py-3">
          <Text className="text-base text-gray-600">群聊名称</Text>
          <View className="flex-row items-center">
            <Text className="mr-2 text-base">{groupName}</Text>
            <Text className="text-gray-400">＞</Text>
          </View>
        </TouchableOpacity>

        {/* 群成员 */}
        <View className="mt-2 bg-white px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-gray-600">群成员</Text>
            <Text className="text-gray-400">{members.length}人 ＞</Text>
          </View>

          {loading ? (
            <Text className="p-4 text-center text-gray-500">加载中...</Text>
          ) : (
            <View className="mt-4 flex-row flex-wrap">
              {members.map((member) => (
                <View key={member.userId} className="mb-4 mr-4 w-16 items-center">
                  <Image
                    source={member.avatarUrl ? { uri: member.avatarUrl } : defaultAvatar}
                    className="h-14 w-14 rounded-lg"
                    contentFit="cover"
                  />
                  <Text className="mt-1 text-center text-xs text-gray-600" numberOfLines={1}>
                    {member.nickname}
                  </Text>
                </View>
              ))}
              <TouchableOpacity 
                className="mb-4 mr-4 w-16 items-center"
                onPress={() => {
                  router.push({
                    pathname: '/select-member',
                    params: { groupId }
                  });
                }}>
                <View className="h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <Text className="text-2xl text-gray-400">+</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
