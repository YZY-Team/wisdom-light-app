import { View, Text, ScrollView, Pressable } from 'react-native';

import { router } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';
import { useCallback, useEffect, useState } from 'react';
import type { Friend } from '~/types/have/friendType';
import { dialogApi } from '~/api/have/dialog';
import { useDialogList } from '~/queries/dialog';
import type { Dialog } from '~/types/have/dialogType';

import defaultAvatar from '~/assets/default-avatar.png';

import * as schema from '~/db/schema';
import { useUserStore } from '~/store/userStore';
import { eq } from 'drizzle-orm';
import { cssInterop } from 'nativewind';
import { Image, ImageSource } from 'expo-image';
import { useDatabase } from '~/contexts/DatabaseContext';

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
const getAvatarSource = (friend: Friend) => {
  if (isValidUrl(friend.avatarUrl ?? '')) {
    return { uri: friend.avatarUrl || '' };
  }

  if (isValidUrl(friend.originalAvatarUrl ?? '')) {
    return { uri: friend.originalAvatarUrl || '' };
  }

  if (isValidUrl(friend.customAvatarUrl ?? '')) {
    return { uri: friend.customAvatarUrl || '' };
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
  const { drizzleDb, isInitialized } = useDatabase();
  const currentUserId = useUserStore((state) => state.userInfo?.globalUserId);
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);
  const { data: dialogResponse, isLoading } = useDialogList();
  const [dialogs, setDialogs] = useState<Dialog[]>([]);

  
  // 获取对话列表
  useEffect(() => {
    if (dialogResponse?.data) {
      setDialogs(dialogResponse.data);
    }
  }, [dialogResponse]);

  // 从本地数据库加载好友数据
  useEffect(() => {
    const loadLocalFriends = async () => {
      if (currentUserId && drizzleDb) {
        try {
          const result = await drizzleDb
            .select()
            .from(schema.friends)
            .where(eq(schema.friends.userId, currentUserId));

          console.log('result', result);
          if (result && result.length > 0) {
            setLocalFriends(
              result.map((item) => ({
                userId: item.friendId,
                username: item.username || '',
                nickname: item.nickname || '',
                remark: item.remark,
                avatarUrl: item.avatarUrl,
                originalAvatarUrl: item.originalAvatarUrl,
                customAvatarUrl: item.customAvatarUrl,
                isFavorite: Boolean(item.isFavorite),
                createTime: item.createTime,
              }))
            );
          }
        } catch (error) {
          console.error('从本地数据库加载好友数据失败:', error);
          // 如果加载失败，至少保持一个空数组
          setLocalFriends([]);
        }
      }
    };

    loadLocalFriends();
  }, [currentUserId, drizzleDb]);

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

  // 构建聊天列表，优先使用服务器返回的对话数据
  const chatList = dialogs.map((dialog) => {
    // 查找对应的好友信息
    const friend = localFriends.find((friend) => friend.userId === dialog.targetUserId);

    // 如果没有对应好友信息，使用基本信息
    if (!friend) {
      return {
        id: dialog.dialogId,
        dialogId: dialog.dialogId,
        avatar: dialog.avatarUrl ? { uri: dialog.avatarUrl } : defaultAvatar,
        name: dialog.title || '未知对话',
        lastMessage: dialog.lastMessageContent || '暂无消息',
        time: dialog.lastMessageTime ? formatTime(dialog.lastMessageTime) : '',
        unreadCount: dialog.unreadCount || 0,
      };
    }

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

    // 使用服务器的数据，没有则使用WebSocket的数据
    const lastMessageContent = lastMessage?.textContent || dialog.lastMessageContent || '暂无消息';
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
      dialogMessages.filter((msg) => msg.senderId === friend.userId && msg.status !== 'READ')
        .length;

    return {
      id: friend.userId,
      dialogId: dialog.dialogId,
      avatar: getAvatarSource(friend),
      name: friend.remark ?? friend.nickname ?? friend.username ?? '未知用户',
      lastMessage: lastMessageContent,
      time: lastMessageTime,
      unreadCount,
    };
  });

  // 如果没有服务器对话，或者WebSocket有额外消息，添加本地对话
  const localChatList = localFriends
    .filter((friend) => !dialogs.some((dialog) => dialog.targetUserId === friend.userId))
    .map((friend) => {
      // 找到所有与该好友相关的消息
      const dialogMessages = Object.entries(messages)
        .filter(([dialogId]) => dialogId !== 'undefined')
        .flatMap(([_, msgs]) =>
          msgs.filter((msg) => msg.senderId === friend.userId || msg.receiverId === friend.userId)
        )
        .sort((a, b) => {
          const timestampA = BigInt(a.timestamp);
          const timestampB = BigInt(b.timestamp);
          return timestampB > timestampA ? 1 : timestampB < timestampA ? -1 : 0;
        });

      const lastMessage = dialogMessages.at(0);

      const time = lastMessage?.timestamp
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
        : '';

      return {
        id: friend.userId,
        dialogId: lastMessage?.dialogId ?? '',
        avatar: getAvatarSource(friend),
        name: friend.remark ?? friend.nickname ?? friend.username,
        lastMessage: lastMessage?.textContent ?? '暂无消息',
        time,
        unreadCount: dialogMessages.filter(
          (msg) => msg.senderId === friend.userId && msg.status !== 'READ'
        ).length,
      };
    })
    .filter((chat) => chat.lastMessage !== '暂无消息'); // 只显示有消息的聊天

  // 合并服务器对话和本地对话
  const combinedChatList = [...chatList, ...localChatList].filter(
    (chat) => chat.lastMessage !== '暂无消息' || chat.dialogId
  ); // 只显示有消息或有对话ID的聊天

  const handleChatPress = async (userName: string, targetUserId: string, dialogId: string) => {
    const startTime = performance.now();
    try {
      // 标记该对话的消息为已读
      console.log('标记消息为已读开始', dialogId, targetUserId);
      markMessagesAsRead(dialogId, targetUserId);

      const routeStart = performance.now();
      router.push({
        pathname: `/private-chat/${dialogId}`,
        params: { userName, dialogId, targetUserId },
      });
      console.log('路由跳转耗时:', performance.now() - routeStart, 'ms');

      console.log('总耗时:', performance.now() - startTime, 'ms');
    } catch (error) {
      console.log('处理对话出错:', error);
    }
  };

  if (isLoading && !combinedChatList.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="mt-4 flex-1 py-4">
      {combinedChatList.map((chat) => (
        <ChatItem
          key={chat.id + chat.dialogId}
          {...chat}
          onPress={() => handleChatPress(chat.name, chat.id, chat.dialogId)}
        />
      ))}
    </ScrollView>
  );
}
