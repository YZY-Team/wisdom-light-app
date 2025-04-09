import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { useWebSocketStore } from '~/store/websocketStore';
import { useState, useCallback } from 'react';

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
    <View className={`${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
      {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
      <View className={`max-w-[70%] rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}>
        <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
      </View>
      <Text className="mt-1 text-xs text-gray-400">{time}</Text>
    </View>
  </View>
);

export default function PrivateChat() {
  const insets = useSafeAreaInsets();
  const { dialogId, userName } = useLocalSearchParams(); // 从路由获取 dialogId 和 userName
  const [inputMessage, setInputMessage] = useState('');
    console.log('dialogId', dialogId);
    
  // 从 Zustand store 获取消息
  const { messages } = useWebSocketStore();
  const chatMessages = messages[dialogId as string] || [];
    console.log('chatMessages', chatMessages);
    
  // WebSocket 上下文
  const { sendMessage } = useWebSocketContext();

  // 将 Zustand 的消息转换为组件需要的格式
  const formattedMessages = chatMessages.map((msg) => ({
    content: msg.textContent,
    time: new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    user: {
      name: msg.senderId === '123' ? '我' : userName as string, // 假设当前用户 ID 是 123
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`,
    },
    isSelf: msg.senderId === '123',
  }));

  // 发送消息
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      type: 'PRIVATE_CHAT',
      dialogId: Number(dialogId), // 使用 dialogId
      senderId: '123', // 假设当前用户 ID 是 123
      receiverId: Number(chatMessages[0]?.senderId === '123' ? chatMessages[0].receiverId : chatMessages[0].senderId), // 对方的 ID
      textContent: inputMessage,
      status: 'CREATED',
      timestamp: Date.now(),
    };

    sendMessage(JSON.stringify(newMessage));
    setInputMessage('');
  }, [inputMessage, sendMessage, dialogId, chatMessages]);

  return (
    <View className="flex-1 bg-[#1483fd]/10">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">{userName}</Text>
      </View>

      {/* 消息区域 */}
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          {formattedMessages.map((msg, index) => (
            <Message key={index} {...msg} />
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
            className="flex-1 flex-row items-center rounded-[12px] bg-gray-100 px-6 py-3"
          >
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