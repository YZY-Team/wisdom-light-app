import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';
import { useEffect, useMemo, useState } from 'react';
import { dialogApi } from '~/api/have/dialog';
import type { Dialog } from '~/types/have/dialogType';

type ChatItemProps = {
  id: string; // 添加 id 属性
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
  const [dialogs, setDialogs] = useState<Dialog[]>([]);

  useEffect(() => {
    dialogApi.getDialogs().then((res) => {
      if (res.code === 200 && res.data) {
        setDialogs(res.data);
      }
    });
  }, []);

  const chatList = useMemo(() => {
    return dialogs.map((dialog) => {
      // 获取对应对话的消息
      const dialogMessages = messages[dialog.dialogId] || [];
      const lastMessage = dialogMessages[dialogMessages.length - 1];

      // 格式化时间
      const time = lastMessage?.timestamp 
        ? new Date(lastMessage.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : dialog.lastMessageTime
          ? new Date(dialog.lastMessageTime).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

      return {
        id: dialog.dialogId,
        dialogId: dialog.dialogId,
        avatar:
          dialog.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dialog.dialogId}`,
        name: dialog.title || `对话 ${dialog.dialogId}`,
        lastMessage: lastMessage?.textContent || '暂无消息',
        time,
        unreadCount: dialog.unreadCount || 0,
      };
    });
  }, [dialogs, messages]); // 确保依赖项正确

  const handleChatPress = (dialogId: string, userName: string) => {
    router.push({
      pathname: `/have/private-chat/${dialogId}`,
      params: { userName, dialogId },
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
