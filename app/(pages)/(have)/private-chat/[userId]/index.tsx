import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { Message, useWebSocketStore } from '~/store/websocketStore';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '~/store/userStore';
import { usePathname } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
type MessageProps = {
  content: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  isSelf?: boolean;
};

const MessageItem = ({ content, time, user, isSelf }: MessageProps) => (
  <View className={`mb-4 flex-row ${isSelf ? 'flex-row-reverse' : ''}`}>
    <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" contentFit="cover" />
    <View className={`flex-1 ${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
      {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
      <View className={`max-w-[70%] rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}>
        <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
      </View>
      <Text className="mt-1 text-xs text-gray-400">{time}</Text>
    </View>
  </View>
);

export default function PrivateChat() {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { dialogId, userName, targetUserId } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState('');
  const headerHeight = useHeaderHeight();
  console.log('对方id', targetUserId);

  // 从 Zustand store 获取消息
  const messages = useWebSocketStore((stats) => stats.messages);

  const chatMessages = messages[String(dialogId)] || [];

  // 添加消息更新时的自动滚动
  // useEffect(() => {
  //   if (scrollViewRef.current) {
  //     setTimeout(() => {
  //       scrollViewRef.current?.scrollToEnd({ animated: true });
  //     }, 100);
  //   }
  // }, [chatMessages]);

  // WebSocket 上下文
  const { sendMessage } = useWebSocketContext();

  // 将 Zustand 的消息转换为组件需要的格式
  // 将时间格式化函数提取出来
  // 优化消息格式化逻辑
  // 优化时间格式化函数
  // 修改 formatTime 的参数类型，接受 string 或 number
  const formatTime = useCallback((timestamp: string | number) => {
    try {
      // 检查时间戳是否为数字字符串或数字
      const ts = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
      if (isNaN(ts)) {
        console.warn('无效的时间戳:', timestamp);
        return '';
      }

      const date = new Date(ts);
      if (date.toString() === 'Invalid Date') {
        console.warn('无效的日期:', timestamp);
        return '';
      }

      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.log('时间格式化错误:', error);
      return '';
    }
  }, []);

  // 将头像URL缓存到 Map 中
  const avatarCache = useRef(new Map<string, string>());
  const getAvatarUrl = useCallback((senderId: string) => {
    if (!avatarCache.current.has(senderId)) {
      avatarCache.current.set(
        senderId,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`
      );
    }
    return avatarCache.current.get(senderId)!;
  }, []);

  // 移除其他重复的性能统计代码
  // 发送消息
  const { addMessage } = useWebSocketStore();

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      type: 'PRIVATE_CHAT',
      senderId: userInfo!.globalUserId,
      receiverId: targetUserId as string,
      dialogId: dialogId as string,
      textContent: inputMessage,
      timestamp: String(Date.now()),
    };
    console.log('发送消息', newMessage);

    // 发送消息
    sendMessage(JSON.stringify(newMessage));
    // 存储消息
    addMessage({ ...newMessage, status: 'READ' });
    setInputMessage('');
  }, [inputMessage, sendMessage, dialogId, addMessage, userInfo, targetUserId]);

  // 添加分页状态
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  // 优化消息获取逻辑
  const visibleMessages = useMemo(() => {
    if (!chatMessages.length) return [];
    const start = Math.max(0, chatMessages.length - page * PAGE_SIZE);
    return chatMessages.slice(start);
  }, [chatMessages, page]);
  const formattedMessages = useMemo(() => {
    const timeCache = new Map<string, string>();

    return visibleMessages.map((msg) => {
      const isSelf = msg.senderId === userInfo?.globalUserId;

      // 使用缓存的时间格式化结果
      let time = timeCache.get(msg.timestamp);
      if (!time) {
        time = formatTime(msg.timestamp);
        timeCache.set(msg.timestamp, time);
      }

      return {
        content: msg.textContent,
        time,
        user: {
          name: isSelf ? '我' : (userName as string),
          avatar: getAvatarUrl(msg.senderId),
        },
        isSelf,
      };
    });
  }, [visibleMessages, userInfo?.globalUserId, userName]);
  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [loading]);

  // 添加一个标记是否是首次加载的 ref
  const isFirstLoad = useRef(true);
  // 添加一个记录之前消息数量的 ref
  const prevMessagesCount = useRef(0);

  // 监听消息变化，判断是否需要滚动
  useEffect(() => {
    if (!scrollViewRef.current) return;

    // 首次加载或有新消息时才滚动
    if (isFirstLoad.current || formattedMessages.length > prevMessagesCount.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }

    isFirstLoad.current = false;
    prevMessagesCount.current = formattedMessages.length;
  }, [formattedMessages]);

  const renderItem = useCallback(({ item: msg }) => <MessageItem {...msg} />, []);

  const keyExtractor = useCallback((item: any, index: number) => `${item.time}-${index}`, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}>
      <View className="flex-1 bg-[#1483fd]/10 py-3">
        {/* 头部 */}
        <View className="flex-row items-center px-4 py-3" style={{ paddingTop: insets.top }}>
          <Pressable
            onPress={() => router.back()}
            className="z-10 h-10 w-10  items-center justify-center"
            style={{ position: 'absolute', left: 16 }}>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-medium">{userName}</Text>
        </View>

        {/* 消息区域 */}
        <View className="flex-1">
          <FlashList
            data={[...formattedMessages].reverse()}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={100}
            contentContainerStyle={{ padding: 16 }}
            inverted
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        </View>

        {/* 底部输入框 */}
        <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 20 || 20 }}>
          <View className="flex-row items-center">
            <View
              style={{
                boxShadow: '0px 4px 4px 0px rgba(82, 100, 255, 0.10)',
              }}
              className="flex-1 flex-row items-center rounded-[12px] bg-gray-100 px-6 py-3">
              <TextInput
                className="flex-1"
                placeholder="请输入消息..."
                placeholderTextColor="#999"
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                multiline={false}
              />
              <Pressable onPress={handleSendMessage}>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
                  <Ionicons name="arrow-up" size={20} color="#fff" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
