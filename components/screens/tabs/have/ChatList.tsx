import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';
import { useCallback, useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import type { Friend } from '~/types/have/friendType';
import { dialogApi } from '~/api/have/dialog';
import { cssInterop } from 'nativewind';
import defaultAvatar from '~/assets/default-avatar.png';
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
    return { uri: friend.avatarUrl };
  }

  if (isValidUrl(friend.originalAvatarUrl ?? '')) {
    return { uri: friend.originalAvatarUrl };
  }

  if (isValidUrl(friend.customAvatarUrl ?? '')) {
    return { uri: friend.customAvatarUrl };
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
  const [friends, setFriends] = useState<Friend[]>([]);


  // 获取好友列表
  const getFriendsList = useCallback(async () => {
    const res = await friendApi.getFriends();
    if (res.code === 200 && res.data) {
      setFriends(res.data);
    }
  }, []);

  // 初始加载和消息更新时都重新获取好友列表
  useEffect(() => {
    getFriendsList();
  }, [getFriendsList, messages]); // 添加 messages 作为依赖

  const chatList = friends.map((friend) => {
    // 找到所有与该好友相关的消息
    const dialogMessages = Object.entries(messages)
      .filter(([dialogId]) => dialogId !== 'undefined') // 过滤掉错误消息
      .flatMap(([_, msgs]) =>
        msgs.filter(msg =>
          msg.senderId === friend.userId || msg.receiverId === friend.userId
        )
      )
      .sort((a, b) => {
        const timestampA = BigInt(a.timestamp);
        const timestampB = BigInt(b.timestamp);
        return timestampB > timestampA ? 1 : timestampB < timestampA ? -1 : 0;
      }); // 按时间排序


    const lastMessage = dialogMessages.at(0); // 获取最新消息

    const time = lastMessage?.timestamp
      ? (() => {
        try {
          // 确保时间戳是数字
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
      unreadCount: dialogMessages.filter(msg =>
        msg.senderId === friend.userId && msg.status !== 'READ'
      ).length, // 只统计对方发来的未读消息
    };
  });


  const handleChatPress = async (userName: string, targetUserId: string) => {
    const startTime = performance.now();
    try {
      // 总是尝试创建对话
      const createStart = performance.now();
      const res = await dialogApi.createDialog(targetUserId);
      console.log('创建对话耗时:', performance.now() - createStart, 'ms');

      let finalDialogId: string;
      if (res.code === 200 && res.data) {
        finalDialogId = res.data;
      } else {
        console.log('创建对话失败');
        return;
      }

      // 标记该对话的消息为已读
      console.log('标记消息为已读开始', finalDialogId, targetUserId);
      markMessagesAsRead(finalDialogId, targetUserId);

      const routeStart = performance.now();
      router.push({
        pathname: `/private-chat/${finalDialogId}`,
        params: { userName, dialogId: finalDialogId, targetUserId },
      });
      console.log('路由跳转耗时:', performance.now() - routeStart, 'ms');

      console.log('总耗时:', performance.now() - startTime, 'ms');
    } catch (error) {
      console.log('处理对话出错:', error);
    }
  };

  return (
    <ScrollView className="flex-1 py-4 mt-4">
      {chatList.map((chat) => (
        <ChatItem
          key={chat.id}
          {...chat}
          onPress={() => handleChatPress(chat.name, chat.id)}
        />
      ))}
    </ScrollView>
  );
}
