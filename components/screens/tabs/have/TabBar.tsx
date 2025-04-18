import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { useFriendRequestStore } from '~/store/friendRequestStore';

// 动态引入所有图片
const tabImages = {
  添加好友: require('~/assets/images/have/tabs/添加好友.png'),
  发起群聊: require('~/assets/images/have/tabs/发起群聊.png'),
  聊天广场: require('~/assets/images/have/tabs/聊天广场.png'),
  视频会议: require('~/assets/images/have/tabs/视频会议.png'),
  寻找支持: require('~/assets/images/have/tabs/寻找支持.png'),
  好友列表: require('~/assets/images/have/tabs/好友列表.png'),
};

cssInterop(Image, { className: 'style' });

const Tab = ({ title, icon, href, badge }: TabProps & { badge?: number }) => (
  <Link href={href} asChild>
    <Pressable className="flex-1 items-center transition-all duration-200">
      <View className="relative w-full items-center py-2">
        <Image
          className="h-8 w-8"
          source={tabImages[title as keyof typeof tabImages]}
          contentFit="contain"
        />
        {badge ? (
          <View className="absolute right-[25%] top-0 h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1">
            <Text className="text-[10px] font-bold text-white">{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
        <Text className="mt-1 text-xs font-medium text-gray-600">{title}</Text>
      </View>
    </Pressable>
  </Link>
);

type TabProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

export default function TabBar() {
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const { shouldRefresh, setShouldRefresh } = useFriendRequestStore();

  const fetchPendingRequests = async () => {
    try {
      const response = await friendApi.getPendingRequests();
      setPendingRequestCount(response.data.length);
    } catch (error) {
      console.log('获取待处理好友请求失败:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // 监听 shouldRefresh 状态变化
  useEffect(() => {
    if (shouldRefresh) {
      fetchPendingRequests();
      setShouldRefresh(false);
    }
  }, [shouldRefresh, setShouldRefresh]);

  return (
    <View
      style={
        {
          // boxShadow: '0px 4px 4px 0px rgba(20, 131, 253, 0.10)',
        }
      }
      className="rounded-[8px] bg-white p-2">
      {/* 第一行 */}
      <View className="mb-[8px] flex-row">
        <Tab
          title="添加好友"
          icon="person-add-outline"
          href="/add-friend"
          badge={pendingRequestCount}
        />
        <Tab title="发起群聊" icon="people-outline" href="/create-group" />
        <Tab title="聊天广场" icon="chatbubbles-outline" href="/chat-square" />
      </View>

      {/* 第二行 */}
      <View className="flex-row">
        <Tab title="视频会议" icon="videocam-outline" href="/video-meeting" />
        <Tab title="寻找支持" icon="help-circle-outline" href="/find-support" />
        <Tab title="好友列表" icon="help-circle-outline" href="/friend-list" />
      </View>
    </View>
  );
}
