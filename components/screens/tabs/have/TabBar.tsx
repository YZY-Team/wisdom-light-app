import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { useFriendRequestStore } from '~/store/friendRequestStore';
import addFriendIcon from '~/assets/images/have/tabs/添加好友.png';
import createGroupIcon from '~/assets/images/have/tabs/发起群聊.png';
import chatSquareIcon from '~/assets/images/have/tabs/聊天广场.png';
import videoMeetingIcon from '~/assets/images/have/tabs/视频会议.png';
import findSupportIcon from '~/assets/images/have/tabs/寻找支持.png';
import friendListIcon from '~/assets/images/have/tabs/好友列表.png';

cssInterop(Image, { className: 'style' });

const Tab = ({ title, href, badge }: { title: string; href: Href; badge?: number }) => {
  const getIcon = () => {
    switch (title) {
      case '添加好友':
        return addFriendIcon;
      case '发起群聊':
        return createGroupIcon;
      case '聊天广场':
        return chatSquareIcon;
      case '视频会议':
        return videoMeetingIcon;
      case '寻找支持':
        return findSupportIcon;
      case '好友列表':
        return friendListIcon;
      default:
        return addFriendIcon;
    }
  };
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 items-center transition-all duration-200">
        <View className="relative w-full items-center py-2">
          <Image className="h-8 w-8" source={getIcon()} contentFit="contain" />
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
      <View className="flex-row">
        <Tab title="添加好友" href="/add-friend" badge={pendingRequestCount} />
        <Tab title="聊天广场" href="/chat-square" />
        <Tab title="视频会议" href="/video-meeting" />
        <Tab title="寻找支持" href="/find-support" />
        <Tab title="好友列表" href="/friend-list" />
      </View>
    </View>
  );
}
