import { View, Text, ScrollView, Pressable } from 'react-native';

import { router } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';
import { useEffect, useState } from 'react';
import type { Friend } from '~/types/have/friendType';
import { dialogApi } from '~/api/have/dialog';
import { useDialogList } from '~/queries/dialog';
import type { Dialog, DialogType } from '~/types/have/dialogType';

import defaultAvatar from '~/assets/default-avatar.png';

import { useUserStore } from '~/store/userStore';
import { cssInterop } from 'nativewind';
import { Image, ImageSource } from 'expo-image';
import { useFriendList } from '~/queries/friend';

cssInterop(Image, { className: 'style' });

type ChatItemProps = {
  id: string;
  avatar: string | { uri: string } | ImageSource;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onPress: () => void;
};

// 检查URL是否有效
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 获取头像源
const getAvatarSource = (avatarUrl?: string | null) => {
  if (isValidUrl(avatarUrl ?? '')) {
    return { uri: avatarUrl || '' };
  }
  return defaultAvatar;
};

// ChatItem 组件保持不变
const ChatItem = ({ id, avatar, name, lastMessage, time, unreadCount, onPress }: ChatItemProps) => (
  <Pressable onPress={onPress}>
    <View className="mb-4 flex-row items-center px-4 py-2">
      <Image source={avatar} className="h-12 w-12 rounded-full" />
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
  const { messages, markMessagesAsRead } = useWebSocketStore();
  const currentUserId = useUserStore((state) => state.userInfo?.globalUserId);
  const { data: dialogResponse, isLoading, refetch } = useDialogList();
  const { data: friendList } = useFriendList();
  const [dialogs, setDialogs] = useState<Dialog[]>([]);

  // 刷新对话列表
  useEffect(() => {
    // 每次组件挂载或激活时刷新对话列表
    refetch();

    // 设置定时器，每30秒刷新一次
    const refreshInterval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [refetch]);

  // 获取对话列表
  useEffect(() => {
    if (dialogResponse?.data) {
      setDialogs(dialogResponse.data);
    }
  }, [dialogResponse]);

  // 格式化时间
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('时间格式化错误:', error);
      return '';
    }
  };

  // 解析消息内容，根据消息类型返回不同的显示文本
  const parseMessageContent = (messageContent: string) => {
    try {
      const parsedContent = JSON.parse(messageContent);
      
      if (parsedContent.type === 'text') {
        return parsedContent.text;
      } else if (parsedContent.type === 'image') {
        return '[图片消息]';
      } else if (parsedContent.type === 'audio') {
        return '[语音消息]';
      } else {
        // 默认情况，直接显示原始内容
        return messageContent;
      }
    } catch (error) {
      // 如果解析失败，直接显示原始内容
      console.warn('消息解析失败:', { content: messageContent, error });
      return messageContent;
    }
  };

  // 构建聊天列表，使用服务器返回的对话数据
  const chatList = dialogs.filter((dialog) => dialog.dialogType !== 3).map((dialog) => {
    // 从WebSocket获取可能还未同步到服务器的最新消息
    const dialogMessages = Object.entries(messages)
      .filter(([dialogId]) => dialogId === dialog.dialogId)
      .flatMap(([_, msgs]) => msgs)
      .sort((a, b) => {
        try {
          const timestampA = BigInt(a.timestamp || '0');
          const timestampB = BigInt(b.timestamp || '0');
          return timestampB > timestampA ? 1 : timestampB < timestampA ? -1 : 0;
        } catch (error) {
          console.warn('消息排序错误:', error);
          return 0;
        }
      });

    const lastMessage = dialogMessages.at(0);

    // 获取原始消息内容
    const rawMessageContent = lastMessage?.textContent || dialog.lastMessageContent || '暂无消息';
    
    // 解析并格式化消息内容
    const formattedMessageContent = dialog.dialogType === 1 
      ? parseMessageContent(rawMessageContent) 
      : rawMessageContent;

    const lastMessageTime = lastMessage?.timestamp
      ? (() => {
          try {
            const timestamp = Number(lastMessage.timestamp);
            if (isNaN(timestamp)) {
              console.warn('无效的时间戳:', lastMessage.timestamp);
              return '';
            }
            return new Date(timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch (error) {
            console.warn('时间格式化错误:', error);
            return '';
          }
        })()
      : formatTime(dialog.lastMessageTime || '');

    const unreadCount =
      dialog.unreadCount ||
      dialogMessages.filter((msg) => msg.senderId !== currentUserId && msg.status !== 'READ')
        .length;

    // 如果对话类型为1（私聊），尝试从好友列表获取头像
    let avatarSource = defaultAvatar;
    let title;
    if (dialog.dialogType === 1 && friendList?.data) {
      // 查找对应的好友
      const friend = friendList.data.find((f) => f.userId === dialog.targetUserId);

      if (friend && friend.avatarUrl) {
        avatarSource = { uri: friend.avatarUrl };
      } else if (dialog.avatarUrl) {
        avatarSource = { uri: dialog.avatarUrl };
      }
      title = friend?.nickname;
    } else if (dialog.avatarUrl) {
      avatarSource = { uri: dialog.avatarUrl };
    }

    return {
      id: dialog.targetUserId || dialog.dialogId,
      dialogId: dialog.dialogId,
      dialogType: dialog.dialogType,
      avatar: avatarSource,
      name: dialog.title || title || '未知对话',
      lastMessage: formattedMessageContent,
      time: lastMessageTime,
      unreadCount,
    };
  });

  const handleChatPress = async (
    userName: string,
    targetUserId: string,
    dialogId: string,
    dialogType: DialogType
  ) => {
    try {
      // 标记该对话的消息为已读
      markMessagesAsRead(dialogId, targetUserId);

      // 根据对话类型决定跳转到私聊还是群聊
      if (dialogType === 2) {
        router.push({
          pathname: `/group-chat/${dialogId}`,
          params: { groupName: userName, dialogId, targetUserId },
        });
      } else {
        router.push({
          pathname: `/private-chat/${dialogId}`,
          params: { userName, dialogId, targetUserId },
        });
      }
    } catch (error) {
      console.log('处理对话出错:', error);
    }
  };

  if (isLoading && !chatList.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="mt-4 flex-1 py-4">
      {chatList.map((chat) => (
        <ChatItem
          key={chat.id + chat.dialogId}
          {...chat}
          onPress={() => handleChatPress(chat.name, chat.id, chat.dialogId, chat.dialogType)}
        />
      ))}
    </ScrollView>
  );
}
