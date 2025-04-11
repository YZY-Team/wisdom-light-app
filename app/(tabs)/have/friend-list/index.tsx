import { View, Text, Pressable, InteractionManager } from 'react-native';
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
  <Pressable className="flex-row items-center bg-[#1483FD0D] border-b border-gray-100 px-4 py-3">
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

// 添加字母索引组件
const AlphabetIndex = ({ onPressLetter }: { onPressLetter: (letter: string) => void }) => {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <View className="absolute right-2 top-1/2 -translate-y-1/2">
      {letters.map((letter) => (
        <Pressable
          key={letter}
          onPress={() => onPressLetter(letter)}
          className="py-1"
        >
          <Text className="text-sm text-gray-500">{letter}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [fps, setFps] = useState(0);

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

  return (
    <View className="flex-1 bg-white">
      {/* 显示FPS */}
      <Text className="absolute top-10 right-4 z-10 text-xs text-gray-500">
        FPS: {fps}
      </Text>

      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center  text-lg font-medium">好友列表</Text>
        <Pressable onPress={() => router.push('/have/friend-list/add-friend')}>
          <Ionicons name="add" size={24} color="#666" />
        </Pressable>

      </View>

      {/* 使用 FlatList 替换 FlashList */}
      <FlatList
        data={generateMockFriends(100)}
        renderItem={({ item }) => <FriendItem item={item} />}
        keyExtractor={item => item.userId}
        // 性能优化配置
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
        // 滚动事件
        scrollEventThrottle={16}
        onScroll={useCallback(() => {
          console.log('Scroll Performance:', performance.now());
        }, [])}
        onMomentumScrollBegin={useCallback(() => {
          console.log('Scroll Start:', performance.now());
        }, [])}
        onMomentumScrollEnd={useCallback(() => {
          console.log('Scroll End:', performance.now());
        }, [])}
        // 样式
        contentContainerStyle={{ paddingBottom: 20 }}
        // 高度设置
        style={{ height: '100%',
          paddingLeft: 16,
          paddingRight: 16,
         }}
      />
      {/* 添加字母索引 */}
      <AlphabetIndex onPressLetter={scrollToLetter} />

    </View>
  );
}
