import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';

type ChatItemProps = {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
};

const ChatItem = ({ avatar, name, lastMessage, time, unreadCount }: ChatItemProps) => (
  <View className="mb-4 flex-row items-center px-4 py-2" >
    <Image source={{ uri: avatar }} className="h-12 w-12 rounded-full" />
    <View className="ml-3 flex-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-gray-900 dark:text-white">{name}</Text>
        <Text className="text-xs text-gray-500">{time}</Text>
      </View>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300" numberOfLines={1}>
          {lastMessage}
        </Text>
        {unreadCount ? (
          <View className="ml-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
            <Text className="text-xs text-white">{unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </View>
  </View>
);

export default function ChatList() {
  const chats = [
    {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      name: '张导师',
      lastMessage: '学习如何格式化表格和数据方式，建立正确的...',
      time: '10:28',
      unreadCount: 1
    },
    {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
      name: '李导师',
      lastMessage: '好的，我们下周三继续讨论这个话题',
      time: '09:15',
      unreadCount: 2
    },
    {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Group1',
      name: '项目研讨群',
      lastMessage: '[图片]',
      time: '昨天',
      unreadCount: 5
    },
    {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
      name: '王老师',
      lastMessage: '好的，收到了，谢谢你的分享',
      time: '昨天'
    },
    {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Study',
      name: '学习小组',
      lastMessage: '小王：这周的学习计划已经整理好了',
      time: '周一'
    }
  ];

  return (
    <ScrollView className="flex-1">
      {chats.map((chat, index) => (
        <ChatItem key={index} {...chat} />
      ))}
    </ScrollView>
  );
}