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
import { router } from 'expo-router';
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

// 按字母分组数据
const groupFriendsByLetter = (friends: Friend[]): FriendGroup => {
  const grouped: FriendGroup = {};

  // 初始化每个字母的分组
  ALPHABET.forEach((letter) => {
    grouped[letter] = [];
  });

  // 按首字母分组
  friends.forEach((friend) => {
    // 优先使用 nickname，如果为空则使用 username（去掉"用户"前缀）
    let name = friend.nickname || friend.username.replace('用户', '');
    let firstLetter = '';

    // 检查是否是中文（使用正则匹配中文字符）
    const isChinese = /[\u4e00-\u9fa5]/.test(name);

    if (isChinese) {
      // 获取拼音（无音调）
      const pinyinStr = pinyin(name, { toneType: 'none' });
      // 取第一个字的拼音首字母
      firstLetter = pinyinStr.split(' ')[0][0].toUpperCase();
    } else {
      // 非中文，直接取首字母
      firstLetter = name.charAt(0).toUpperCase();
    }

    // 确保首字母在 A-Z 范围内
    if (ALPHABET.includes(firstLetter)) {
      grouped[firstLetter].push(friend);
    }
  });

  // 过滤掉没有好友的字母组
  Object.keys(grouped).forEach((letter) => {
    if (grouped[letter].length === 0) {
      delete grouped[letter];
    }
  });

  return grouped;
};

// 展平数据为 FlashList 格式
const flattenGroupedData = (groupedData: FriendGroup): Item[] => {
  return Object.entries(groupedData).reduce((acc: Item[], [letter, friends]) => {
    // 添加分组头
    acc.push({ type: 'header', title: letter, key: `header-${letter}` });
    // 添加好友项（每行一个）
    friends.forEach((friend, index) => {
      acc.push({
        type: 'item',
        friends: [friend],
        key: `item-${letter}-${index}`,
      });
    });
    return acc;
  }, []);
};

// 好友项组件
const FriendItem = memo(({ item }: { item: Friend }) => (
  <Pressable
    className="flex-row items-center bg-white py-3"
    onPress={() => {
      console.log('aaa');

      router.push({
        pathname: '/friend-detail',
        params: { friendId: item.userId, friendInfo: JSON.stringify(item) },
      });
    }}>
    <Image
      source={{ uri: item.avatarUrl }}
      className="h-12 w-12 rounded-full"
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium">{item.nickname}</Text>
    </View>
  </Pressable>
));

// 分组标题组件
const GroupHeader = memo(({ letter }: { letter: string }) => (
  <View className="mb-2 px-2">
    <View className="h-6 w-6 items-center justify-center rounded-sm">
      <Text className="text-[14px] text-black">{letter}</Text>
    </View>
  </View>
));

export default function FriendList() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  const { data: friendResponse, isLoading, error } = useFriendList();
  
  // 使用DatabaseContext
  const { drizzleDb, isInitialized } = useDatabase();
  
  // 获取当前用户ID
  const currentUserId = useUserStore((state) => state.userInfo?.globalUserId);
  // 本地存储的好友数据
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);

  // 从本地数据库加载好友数据
  useEffect(() => {
    const loadLocalFriends = async () => {
      if (currentUserId && drizzleDb) {
        try {
          console.log('从本地数据库加载好友数据');
          const result = await drizzleDb
            .select()
            .from(schema.friends)
            .where(eq(schema.friends.userId, currentUserId));

          if (result && result.length > 0) {
            console.log('本地数据库中找到好友数据', result.length);
            setLocalFriends(
              result.map((item) => ({
                userId: item.friendId,
                username: item.username || '',
                nickname: item.nickname || '',
                remark: item.remark,
                avatarUrl: item.avatarUrl,
                originalAvatarUrl: item.originalAvatarUrl,
                customAvatarUrl: item.customAvatarUrl,
                isFavorite: Boolean(item.isFavorite),
                createTime: item.createTime,
              }))
            );
          } else {
            console.log('本地数据库中没有找到好友数据');
          }
        } catch (error) {
          console.error('从本地数据库加载好友数据失败:', error);
        }
      }
    };

    loadLocalFriends();
  }, [currentUserId, drizzleDb]);

  // 从 ApiResponse 中获取好友列表数据
  const friends = friendResponse?.data || localFriends || [];

  // 将好友数据同步到 SQLite 数据库
  useEffect(() => {
    const syncFriendsToDatabase = async () => {
      try {
        if (friends && friends.length > 0 && currentUserId && drizzleDb) {
          console.log('开始同步好友数据到本地数据库');

          // 准备用户数据插入
          const usersToInsert = friends.map((friend) => ({
            id: friend.userId,
            nickname: friend.nickname || null,
            avatarLocalPath: null,
            avatarRemoteUrl: friend.originalAvatarUrl || friend.avatarUrl,
          }));

          // 准备好友关系数据插入
          const friendsToInsert = friends.map((friend) => ({
            userId: currentUserId, // 使用当前用户ID
            friendId: friend.userId, // 好友的ID
            username: friend.username,
            nickname: friend.nickname,
            remark: friend.remark,
            avatarUrl: friend.avatarUrl,
            originalAvatarUrl: friend.originalAvatarUrl,
            customAvatarUrl: friend.customAvatarUrl,
            isFavorite: friend.isFavorite,
            createTime: friend.createTime,
          }));

          // 先确保用户数据存在
          for (const user of usersToInsert) {
            try {
              if (!user.id) {
                console.warn('跳过插入缺少ID的用户数据');
                continue;
              }
              
              await drizzleDb
                .insert(schema.users)
                .values(user)
                .onConflictDoUpdate({
                  target: schema.users.id,
                  set: {
                    nickname: user.nickname,
                    avatarRemoteUrl: user.avatarRemoteUrl,
                  },
                });
            } catch (err) {
              console.error('插入用户数据出错:', err);
            }
          }

          // 再插入好友关系
          for (const friend of friendsToInsert) {
            try {
              if (!friend.userId || !friend.friendId || !friend.createTime) {
                console.warn('跳过插入不完整的好友数据');
                continue;
              }
              
              await drizzleDb
                .insert(schema.friends)
                .values(friend)
                .onConflictDoUpdate({
                  target: [schema.friends.userId, schema.friends.friendId],
                  set: {
                    nickname: friend.nickname,
                    remark: friend.remark,
                    avatarUrl: friend.avatarUrl,
                    originalAvatarUrl: friend.originalAvatarUrl,
                    customAvatarUrl: friend.customAvatarUrl,
                    isFavorite: friend.isFavorite,
                  },
                });
            } catch (err) {
              console.error('插入好友数据出错:', err);
            }
          }

          console.log('好友数据同步完成');
        }
      } catch (error) {
        console.error('同步好友数据到数据库失败:', error);
      }
    };

    syncFriendsToDatabase();
  }, [friends, currentUserId, drizzleDb]);

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
              className="ml-2 flex-1 h-[30px] py-0 text-[14px] text-black"
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
