import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { useWebSocketStore } from '~/store/websocketStore';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '~/store/userStore';
import { usePathname } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

type MessageProps = {
  content: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  isSelf?: boolean;
};

const Message = ({ content, time, user, isSelf }: MessageProps) => (
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
  const renderTimeRef = useRef(performance.now());

  // 只保留一个性能统计
  useFocusEffect(
    useCallback(() => {
      const startTime = performance.now();
      console.log('页面获得焦点，开始计时');

      return () => {
        const endTime = performance.now();
        console.log(`页面失去焦点，总耗时: ${endTime - startTime} 毫秒`);
      };
    }, [])
  );

  // 只保留组件渲染时间统计
  useEffect(() => {
    const endTime = performance.now();
    console.log(`组件渲染耗时: ${endTime - renderTimeRef.current} 毫秒`);
    renderTimeRef.current = endTime;
  });

  // 删除这部分重复的路由监听
  // useEffect(() => {
  //   console.log('页面获得焦点，开始计时');
  //   renderTimeRef.current = performance.now();
  // }, [pathname]);

  const pathname = usePathname();

  useEffect(() => {
    const endTime = performance.now();
    console.log(`组件渲染耗时: ${endTime - renderTimeRef.current} 毫秒`);
    renderTimeRef.current = endTime;
  });

  // 监听路由变化
  useEffect(() => {
    console.log('页面获得焦点，开始计时');
    renderTimeRef.current = performance.now();
  }, [pathname]);

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { dialogId, userName, targetUserId } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState('');
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
  const formatTime = useCallback((timestamp: string) => {
    try {
      // 检查时间戳是否为数字字符串
      const ts = Number(timestamp);
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
      console.error('时间格式化错误:', error);
      return '';
    }
  }, []);

  // 将头像URL缓存到 Map 中
  const avatarCache = useRef(new Map<string, string>());
  const getAvatarUrl = useCallback((senderId: string) => {
    if (!avatarCache.current.has(senderId)) {
      avatarCache.current.set(senderId, `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`);
    }
    return avatarCache.current.get(senderId)!;
  }, []);

  // 优化消息格式化逻辑
  const formattedMessages = useMemo(() => {
    if (!chatMessages.length) return [];
    
    const startTime = performance.now();
    const result = chatMessages.map((msg) => {
      const isSelf = msg.senderId === userInfo?.globalUserId;
      
      // 避免在循环中多次调用 formatTime
      const time = formatTime(msg.timestamp);
      const avatar = getAvatarUrl(msg.senderId);
      
      return {
        content: msg.textContent,
        time,
        user: {
          name: isSelf ? '我' : (userName as string),
          avatar,
        },
        isSelf,
      };
    });
    
    const endTime = performance.now();
    console.log(`消息格式化耗时: ${endTime - startTime} 毫秒`);
    return result;
  }, [chatMessages, userInfo?.globalUserId, userName, formatTime, getAvatarUrl]);

  // 移除其他重复的性能统计代码
  // 发送消息
  const { addMessage } = useWebSocketStore();

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      type: 'PRIVATE_CHAT',
      senderId: userInfo?.globalUserId,
      receiverId: targetUserId,
      dialogId: dialogId,
      textContent: inputMessage,
      // status: 'SENT' as const,
      timestamp: String(Date.now()),
    };
    console.log('发送消息', newMessage);

    // 发送消息
    sendMessage(JSON.stringify(newMessage));
    // 存储消息
    addMessage(newMessage);
    setInputMessage('');
  }, [inputMessage, sendMessage, dialogId, addMessage, userInfo, targetUserId]);

  return (
    <View className="flex-1 bg-[#1483fd]/10">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3" style={{ paddingTop: insets.top }}>
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">{userName}</Text>
      </View>

      {/* 消息区域 */}
      <View className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}>
          {formattedMessages.map((msg, index) => (
            <Message key={`${msg.time}-${index}`} {...msg} />
          ))}
        </ScrollView>
      </View>

      {/* 底部输入框 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
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
      </KeyboardAvoidingView>
    </View>
  );
}
