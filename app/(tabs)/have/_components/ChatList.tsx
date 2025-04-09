import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';
import { useMemo } from 'react';

type ChatItemProps = {
  id: string;  // 添加 id 属性
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onPress: () => void;
};

const ChatItem = ({ id, avatar, name, lastMessage, time, unreadCount, onPress }: ChatItemProps) => (
  <Pressable onPress={onPress}>
    <View className="mb-4 flex-row items-center px-4 py-2">
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
  </Pressable>
);

export default function ChatList() {
  const { messages } = useWebSocketStore();

  const chatList = useMemo(() => {
    return Object.entries(messages).map(([dialogId, dialogMessages]) => {
      // 获取最后一条消息
      const lastMessage = dialogMessages[dialogMessages.length - 1];
      
      // 格式化时间
      const time = new Date(lastMessage.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // 确定对话对象ID（非自己的用户ID）
      const partnerId = lastMessage.senderId === '123' ? lastMessage.receiverId : lastMessage.senderId;

      return {
        id: partnerId,
        dialogId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`,
        name: `用户${partnerId}`, // 这里可以替换为真实的用户名
        lastMessage: lastMessage.textContent,
        time,
        // 可以根据需要添加未读消息计数
        unreadCount: dialogMessages.filter(msg => 
          msg.status === 'CREATED' && msg.senderId !== '123'
        ).length
      };
    });
  }, [messages]);

  const handleChatPress = (dialogId: string, userName: string) => {
    router.push({
      pathname: `/have/private-chat/${dialogId}`,
      params: { userName, dialogId}
    });
  };

  return (
    <ScrollView className="flex-1">
      {chatList.map((chat) => (
        <ChatItem 
          key={chat.dialogId} 
          {...chat} 
          onPress={() => handleChatPress(chat.dialogId, chat.name)}
        />
      ))}
    </ScrollView>
  );
}