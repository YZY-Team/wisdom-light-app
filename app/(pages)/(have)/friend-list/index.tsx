import { View, Text, Pressable, InteractionManager, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import type { Friend } from '~/types/have/friendType';

// 生成模拟数据
const generateMockFriends = (count: number): Friend[] => {
  const letters = ['a', 'b', 'c', 'd'];
  return Array.from({ length: count }, (_, i) => ({
    userId: `user_${i + 1}`,
    username: `${letters[i % letters.length]}用户${i + 1}`,
    nickname: `${letters[i % letters.length]}昵称${i + 1}`,
    remark: i % 3 === 0 ? `备注${i + 1}` : null,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
    originalAvatarUrl: null,
    customAvatarUrl: null,
    isFavorite: i % 5 === 0,
    createTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// 将 FriendItem 组件使用 memo 包裹以避免不必要的重渲染
const FriendItem = memo(({ item }: { item: Friend }) => (
  <Pressable className="flex-row items-center bg-[#1483FD0D] border-b border-gray-100 px-4 py-3 rounded-[12px] my-1">
    <Image
      source={{ uri: item.avatarUrl }}
      className="h-12 w-12 rounded-full"
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium">
        {item.remark || item.nickname || item.username}
      </Text>
    </View>
  </Pressable>
));

// 字母分组标题组件
const GroupHeader = memo(({ letter }: { letter: string }) => (
  <View className="mt-4 mb-2">
    <View className="bg-[#F5F8FC] py-1 px-3 rounded-md w-[24px] h-[24px] justify-center items-center">
      <Text className="text-[14px] font-normal">{letter}</Text>
    </View>
  </View>
));

// 添加字母索引组件
const AlphabetIndex = ({ onPressLetter }: { onPressLetter: (letter: string) => void }) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <View className="absolute right-2 top-1/2 -translate-y-1/2">
      {letters.map((letter) => (
        <Pressable
          key={letter}
          onPress={() => onPressLetter(letter)}
          className="py-[2px]"
        >
          <Text className="text-[12px] text-black/50">{letter}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [fps, setFps] = useState(0);
  const [searchText, setSearchText] = useState('');

  // 添加性能监测
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();

    const measureFPS = () => {
      const currentTime = Date.now();
      const delta = currentTime - lastTime;
      if (delta >= 1000) {
        setFps(Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastTime = currentTime;
      }
      frameCount++;
      requestAnimationFrame(measureFPS);
    };

    const frameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 添加 getItemType 以优化异构列表性能
  const getItemType = useCallback((item: Friend) => {
    return item.isFavorite ? 'favorite' : 'normal';
  }, []);

  const flatListRef = useRef<FlatList>(null);

  const scrollToLetter = (letter: string) => {
    const index = friends.findIndex(friend => 
      friend.username.toLowerCase().startsWith(letter.toLowerCase())
    );
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  // 按字母分组数据
  const groupedData = useCallback(() => {
    const mockData = generateMockFriends(100);
    const grouped: { [key: string]: Friend[] } = {};
    
    // 按首字母分组
    mockData.forEach(friend => {
      const firstLetter = (friend.username.charAt(0) || '').toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(friend);
    });
    
    // 转换为渲染数据
    const sections: any[] = [];
    Object.keys(grouped).sort().forEach(letter => {
      sections.push({ type: 'header', letter });
      grouped[letter].forEach(friend => {
        sections.push({ type: 'item', data: friend });
      });
    });
    
    return sections;
  }, []);

  const renderItem = useCallback(({ item }: any) => {
    if (item.type === 'header') {
      return <GroupHeader letter={item.letter} />;
    } else {
      return <FriendItem item={item.data} />;
    }
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">好友列表</Text>
        <Pressable onPress={() => router.push('/have/friend-list/add-friend')}>
          <Text className="text-black/50 text-[16px]">添加朋友</Text>
        </Pressable>
      </View>

      {/* 搜索框 */}
      <View className="mx-4 mb-4">
        <View className="flex-row items-center bg-[#1483FD0D] rounded-[20px] px-4 py-2">
          <Ionicons name="search-outline" size={20} color="rgba(0,0,0,0.4)" />
          <TextInput
            className="flex-1 ml-2 text-[14px] text-black"
            placeholder="搜索"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 使用 FlatList 替换 FlashList */}
      <FlatList
        ref={flatListRef}
        data={groupedData()}
        renderItem={renderItem}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header-${item.letter}` : `item-${item.data.userId}`
        }
        // 性能优化配置
        initialNumToRender={15}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        // 滚动事件
        scrollEventThrottle={16}
        // 样式
        contentContainerStyle={{ paddingBottom: 20 }}
        // 高度设置
        style={{ 
          height: '100%',
          paddingHorizontal: 16,
        }}
      />
      {/* 添加字母索引 */}
      <AlphabetIndex onPressLetter={scrollToLetter} />
    </View>
  );
}
