import { View, Text, Pressable, InteractionManager } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import type { Friend } from '~/types/have/friendType';

// 生成模拟数据
const generateMockFriends = (count: number): Friend[] => {
  return Array.from({ length: count }, (_, i) => ({
    userId: `user_${i + 1}`,
    username: `用户${i + 1}`,
    nickname: `昵称${i + 1}`,
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
  <Pressable className="flex-row items-center border-b border-gray-100 px-4 py-3">
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
      <Text className="mt-1 text-sm text-gray-500">好友</Text>
    </View>
    <Text className="text-sm text-gray-400">
      {new Date(item.createTime).toLocaleDateString()}
    </Text>
  </Pressable>
));

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
        <Text className="flex-1 text-center text-lg font-medium">好友列表</Text>
      </View>

      {/* 添加一个固定高度的容器 */}
      <View style={{ height: '100%' }}>
        <FlashList
          data={generateMockFriends(100)}
          renderItem={FriendItem}
          estimatedItemSize={73}
          contentContainerStyle={{ paddingBottom: 20 }}
          // 优化性能配置
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={3}
          overrideItemLayout={(layout, item) => {
            layout.size = 73; // 固定每项高度
          }}
          keyExtractor={item => item.userId}
          // 减少滚动时的回调频率
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
        />
      </View>
    </View>
  );
}
