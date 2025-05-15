import {
  View,
  Text,
  Pressable,
  InteractionManager,
  TextInput,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { router, useFocusEffect } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import type { Friend } from '~/types/have/friendType';
import { useFriendList } from '~/queries/friend';
import { pinyin } from 'pinyin-pro';
import * as schema from '~/db/schema';
import { useUserStore } from '~/store/userStore';
import { eq } from 'drizzle-orm';
import { useDatabase } from '~/contexts/DatabaseContext';
import FriendTab from '~/components/screens/tabs/have/FriendTab';
import GroupTab from '~/components/screens/tabs/have/GroupTab';
import { useQueryClient } from '@tanstack/react-query';

// 字母索引数据
const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // 添加 '#' 用于特殊情况

// 接口定义
interface FriendGroup {
  [key: string]: Friend[];
}

interface Item {
  type: string;
  key: string;
  title?: string;
  friends?: Friend[];
}

export default function FriendList() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  const queryClient = useQueryClient();
  const { data: friendResponse, isLoading, error } = useFriendList();
  // 本地存储的好友数据
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);

  // 每次页面获得焦点时刷新好友列表数据
  useFocusEffect(
    useCallback(() => {
      // 当页面获得焦点时，刷新好友列表数据
      queryClient.invalidateQueries({ queryKey: ['friendList'] });

      return () => {
        // 页面失去焦点时的清理工作（如果需要）
      };
    }, [queryClient])
  );

  // 从 ApiResponse 中获取好友列表数据
  const friends = friendResponse?.data || [];

  console.log({ friends });
  return (
    <View className="flex-1">
      {/* 顶部导航栏 */}
      <View className="relative flex-row items-center justify-center bg-white px-4 py-3">
        {/* 返回按钮 */}
        <Pressable
          onPress={() => router.back()}
          className="absolute bottom-0 left-4 top-0 z-10 justify-center">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        {/* 标题 */}
        <Text className="text-center text-lg font-medium">好友列表</Text>
        {/* 添加好友按钮 */}
        <Pressable
          onPress={() => router.push('/add-friend')}
          className="absolute bottom-0 right-4 top-0 z-10 justify-center">
          <Text className="text-[16px] text-black/50">添加朋友</Text>
        </Pressable>
      </View>

      <View className="bg-white">
        {/* 搜索框 */}
        <View className="mx-4 mb-1">
          <View className="flex-row items-center rounded-[20px] bg-[#1483FD0D] px-4">
            <Ionicons name="search-outline" size={20} color="rgba(0,0,0,0.4)" />
            <TextInput
              className="ml-2 h-[30px] flex-1 py-0 text-[14px] text-black"
              placeholder="搜索"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Tab 栏 */}
        <View
          style={{
            boxShadow: '0px 4px 4px 0px rgba(20, 131, 253, 0.05)',
          }}
          className="mx-4 mb-4 flex-row items-center justify-between rounded-[6px] bg-[#1483FD1A] px-2 py-[6px]">
          <TouchableOpacity
            onPress={() => setActiveTab('friends')}
            className={`h-10 w-[45%] items-center justify-center rounded-lg ${
              activeTab === 'friends' ? 'bg-white' : ''
            }`}>
            <Text className="text-[14px]">好友列表</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('groups')}
            className={`h-10 w-[45%] items-center justify-center rounded-lg ${
              activeTab === 'groups' ? 'bg-white' : ''
            }`}>
            <Text className="text-[14px]">群聊列表</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 内容区域 */}
      {isLoading && localFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      ) : error && localFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">加载失败，请重试</Text>
          <Text className="text-gray-500">使用本地缓存数据时，需要先至少连接一次网络</Text>
        </View>
      ) : (
        <View className="flex-1">
          {activeTab === 'friends' ? (
            <FriendTab friends={friends} searchText={searchText} />
          ) : (
            <GroupTab searchText={searchText} />
          )}
        </View>
      )}
    </View>
  );
}
