import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { useFriendRequestStore } from '~/store/friendRequestStore';
import addFriendIcon from '~/assets/images/have/tabs/addFriend.png';
import chatSquareIcon from '~/assets/images/have/tabs/chatSquare.png';
import videoMeetingIcon from '~/assets/images/have/tabs/videoMeeting.png';
import findSupportIcon from '~/assets/images/have/tabs/findSupport.png';
import friendListIcon from '~/assets/images/have/tabs/friendList.png';

cssInterop(Image, { className: 'style' });

const Tab = ({
  title,
  href,
  badge,
  icon,
}: {
  title: string;
  href: Href;
  badge?: number;
  icon: any;
}) => {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 items-center transition-all duration-200">
        <View className="relative w-full items-center py-2">
          <Image className="h-8 w-8" source={icon} contentFit="contain" />
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
      className="rounded-[8px] bg-white py-2">
      <View className="flex-row">
        <Tab title="添加好友" href="/add-friend" badge={pendingRequestCount} icon={addFriendIcon} />
        <Tab title="聊天广场" href="/chat-square" icon={chatSquareIcon} />
        <Tab title="视频会议" href="/video-meeting" icon={videoMeetingIcon} />
        <Tab title="寻找支持" href="/find-support" icon={findSupportIcon} />
        <Tab title="好友列表" href="/friend-list" icon={friendListIcon} />
      </View>
    </View>
  );
}
