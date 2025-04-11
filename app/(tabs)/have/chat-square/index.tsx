import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useState, useCallback, useEffect } from 'react';

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
    <View className={`${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
      {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
      <View className={`max-w-[70%] rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}>
        <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
      </View>
      <Text className="mt-1 text-xs text-gray-400">{time}</Text>
    </View>
  </View>
);

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<MessageProps[]>([
    {
      content: '我上周参加了，学习积分讲得很实用，强烈推荐！',
      time: '10:22',
      user: {
        name: 'Kitty',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
      },
    },
    {
      content: '我也觉得很不错，特别是关于个人成长部分的内容',
      time: '10:23',
      user: {
        name: 'Rhea',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
      },
      isSelf: true,
    },
    {
      content: '下次什么时候还有类似的活动？',
      time: '10:25',
      user: {
        name: 'Tom',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
      },
    },
    {
      content: "据说下个月中旬会有一场，主题是'智慧之光修行体系'",
      time: '10:26',
      user: {
        name: 'Sarah',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    },
    {
      content: '太好了，我一定要参加！',
      time: '10:27',
      user: {
        name: 'Rhea',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
      },
      isSelf: true,
    },
  ]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://192.168.1.158:8108/ws/message?userId=123',
    {
      onOpen: () => {
        console.log('WebSocket 连接已建立');
      },
      onClose: () => {
        console.log('WebSocket 连接已关闭');
      },
      onError: (error) => {
        console.error('WebSocket 错误:', error);
      },
      onMessage: (event) => {

        // try {
        //   const data = JSON.parse(event.data);
        //   setMessages((prev) => [...prev, {
        //     content: data.content,
        //     time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        //     user: {
        //       name: data.user.name,
        //       avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.name}`,
        //     },
        //     isSelf: data.userId === '123'
        //   }]);
        // } catch (error) {
        //   console.error('解析消息失败:', error);
        // }
      },
    }
  );

  useEffect(() => {
    const connectionStatus = {
      [ReadyState.CONNECTING]: '正在连接',
      [ReadyState.OPEN]: '已连接',
      [ReadyState.CLOSING]: '正在关闭',
      [ReadyState.CLOSED]: '已关闭',
      [ReadyState.UNINSTANTIATED]: '未初始化',
    }[readyState];

    console.log('WebSocket 状态:', connectionStatus);
  }, [readyState]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    sendMessage(
      JSON.stringify({
        "type": "GROUP_CHAT",
        "dialogId": 888888,
        "textContent": "你好，这是一条消息",
        "clientMessageId": "client-msg-123"
      })
    );

    setInputMessage('');
  }, [inputMessage, sendMessage]);

  return (
    <View className="flex-1 bg-[#1483fd]/10">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">聊天广场</Text>
      </View>

      {/* 消息区域 */}
      <View className="flex-1">
        <Text className="px-4 py-2 text-center text-sm text-[#757575]">
          欢迎来到聊天广场，请文明发言！
        </Text>
        <ScrollView className="flex-1 p-4">
          {messages.map((msg, index) => (
            <MessageItem key={index} {...msg} />
          ))}
        </ScrollView>
      </View>

      {/* 底部输入框 */}
      <View style={{ paddingBottom: insets.bottom + 20 || 20 }} className="p-4">
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
  );
}
