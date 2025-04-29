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
  const flashListRef = useRef<FlashList<Item>>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const alphabetContainerRef = useRef<View>(null);
  const [alphabetLayout, setAlphabetLayout] = useState({ height: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { data: friendResponse, isLoading, error } = useFriendList();
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends'); // 新增状态管理 active tab
  
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

  // 根据搜索文本过滤好友
  const filteredFriends = friends.filter((friend: Friend) => {
    const searchLower = searchText.toLowerCase();
    return (
      friend.nickname?.toLowerCase().includes(searchLower) ||
      friend.username?.toLowerCase().includes(searchLower) ||
      friend.remark?.toLowerCase().includes(searchLower)
    );
  });

  // 生成并展平数据
  const groupedData = groupFriendsByLetter(filteredFriends);

  const flattenedData = flattenGroupedData(groupedData);

  // 处理字母选择，滚动到对应分组
  const handleLetterSelect = (letter: string) => {
    setActiveLetter(letter);
    const index = flattenedData.findIndex(
      (item) => item.type === 'header' && item.title === letter
    );
    if (index !== -1 && flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  // 测量字母索引容器的布局
  useEffect(() => {
    if (alphabetContainerRef.current) {
      setTimeout(() => {
        alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setAlphabetLayout({ height, y: pageY });
        });
      }, 500);
    }
  }, []);

  // 根据触摸位置找到对应的字母
  const findLetterAtPosition = (touchY: number) => {
    if (alphabetLayout.height <= 0) return;

    const relativeY = touchY - alphabetLayout.y;
    const letterHeight = alphabetLayout.height / ALPHABET.length;
    const index = Math.min(Math.max(Math.floor(relativeY / letterHeight), 0), ALPHABET.length - 1);
    const letter = ALPHABET[index];

    if (letter && letter !== activeLetter) {
      handleLetterSelect(letter);
    }
  };

  // 处理触摸事件
  const handleTouchStart = (e: GestureResponderEvent) => {
    setIsDragging(true);
    findLetterAtPosition(e.nativeEvent.pageY);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (isDragging) {
      findLetterAtPosition(e.nativeEvent.pageY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setActiveLetter(null);
  };

  // 渲染字母气泡提示
  const renderLetterBubble = () => {
    if (!activeLetter) return null;

    return (
      <View className="absolute right-12 items-center justify-center" style={{ top: '40%' }}>
        <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Text className="text-2xl font-bold text-white">{activeLetter}</Text>
        </View>
      </View>
    );
  };

  // 渲染字母索引项
  const renderLetter = (letter: string) => (
    <TouchableOpacity
      key={letter}
      className="h-5 items-center justify-center"
      onPress={() => handleLetterSelect(letter)}>
      <Text
        className={`text-[12px] ${activeLetter === letter ? 'font-bold text-white' : 'text-gray-300'}`}>
        {letter}
      </Text>
    </TouchableOpacity>
  );

  // 渲染列表项
  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === 'header') {
      return <GroupHeader letter={item.title || ''} />;
    }
    return (
      <View>{item.friends?.map((friend) => <FriendItem key={friend.userId} item={friend} />)}</View>
    );
  };

  // 估算每项高度
  const getItemHeight = (item: Item) => {
    if (item.type === 'header') return 32;
    return 72; // 好友项高度
  };

  return (
    <View className="flex-1 ">
      {/* Use relative positioning on the parent and absolute on children */}
      <View className="relative flex-row items-center justify-center bg-white px-4 py-3">
        {/* Back Button - Absolute Left */}
        <Pressable
          onPress={() => router.back()}
          className="absolute bottom-0 left-4 top-0 z-10 justify-center">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        {/* Title - Centered */}
        <Text className="text-center text-lg font-medium">好友列表</Text>
        {/* Add Friend Button - Absolute Right */}
        <Pressable
          onPress={() => router.push('/add-friend')}
          className="absolute bottom-0 right-4 top-0 z-10 justify-center">
          <Text className="text-[16px] text-black/50">添加朋友</Text>
        </Pressable>
      </View>
      <View className=" bg-white">
        {/* 搜索框 */}
        <View className="mx-4 mb-1">
          <View className="flex-row items-center rounded-[20px] bg-[#1483FD0D] px-4 ">
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
          className="mx-4 mb-4 flex-row items-center justify-between  rounded-[6px] bg-[#1483FD1A] px-2 py-[6px]">
          <TouchableOpacity
            onPress={() => setActiveTab('friends')}
            className={`h-10 w-[45%] items-center  justify-center rounded-lg ${activeTab === 'friends' ? 'bg-white' : ''}`}>
            <Text className={`text-[14px]  `}>好友列表</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('groups')}
            className={`h-10 w-[45%] items-center  justify-center rounded-lg ${activeTab === 'groups' ? 'bg-white' : ''}`}>
            <Text className={`text-[14px] `}>群聊列表</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && localFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      ) : error && localFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">加载失败，请重试</Text>
          <Text className="text-gray-500">使用本地缓存数据时，需要先至少连接一次网络</Text>
        </View>
      ) : flattenedData.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">暂无好友</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* FlashList 渲染分组列表 - 根据 activeTab 决定显示内容 */}
          {activeTab === 'friends' && (
            <FlashList
              ref={flashListRef}
              data={flattenedData}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              estimatedItemSize={72}
              getItemType={(item) => item.type}
              overrideItemLayout={(layout, item) => {
                layout.size = getItemHeight(item);
              }}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.5}
            />
          )}
          {/* 群聊列表暂时显示提示，后续可替换为真实列表 */}
          {activeTab === 'groups' && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">群聊列表开发中...</Text>
              {/* 这里可以暂时也用 FlashList 显示好友数据，或者显示其他占位符 */}
              {/* <FlashList data={[]} renderItem={() => null} estimatedItemSize={50} /> */}
            </View>
          )}

          {/* 字母索引侧边栏 - 改为绝对定位 */}
          {/* 仅在好友列表 Tab 显示字母索引 */}
          {activeTab === 'friends' && flattenedData.length > 0 && (
            <View className="absolute bottom-0 right-0 top-0 w-12 items-center justify-center">
              {/* 显示选中字母的气泡 */}
              {renderLetterBubble()}

              {/* 字母索引列表 */}
              <View
                ref={alphabetContainerRef}
                className="items-center justify-center"
                onLayout={() => {
                  setTimeout(() => {
                    alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      if (height > 0 && pageY > 0) {
                        setAlphabetLayout({ height, y: pageY });
                      }
                    });
                  }, 500);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}>
                {ALPHABET.map((letter) => renderLetter(letter))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
