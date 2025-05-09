import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect, useRef } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useWebSocketContext } from '~/contexts/WebSocketContext';

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
  <View className={`mb-4 flex-row ${isSelf ? 'justify-end' : 'justify-start'}`}>
    {!isSelf && (
      <Image source={{ uri: user.avatar }} className="mr-2 h-10 w-10 rounded-full" contentFit="cover" />
    )}
    <View className="max-w-[80%]">
      {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
      <View className={`rounded-2xl px-4 py-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}>
        <Text className={`text-sm ${isSelf ? 'text-white' : 'text-gray-800'}`}>{content}</Text>
        <Text className={`mt-1 text-xs ${isSelf ? 'text-white/40' : 'text-gray-400'}`}>{time}</Text>
      </View>
    </View>
    {isSelf && (
      <Image source={{ uri: user.avatar }} className="ml-2 h-10 w-10 rounded-full" contentFit="cover" />
    )}
  </View>
);

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  const [inputMessage, setInputMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, lastMessage, readyState } = useWebSocketContext();
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

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'GROUP_CHAT') {
          setMessages((prev) => [...prev, {
            content: data.textContent,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            user: {
              name: data.senderName || '未知用户',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.senderName || 'Unknown'}`,
            },
            isSelf: false
          }]);
          
          // 滚动到底部
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (error) {
        console.log('解析消息失败:', error);
      }
    }
  }, [lastMessage]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      content: inputMessage,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      user: {
        name: 'Rhea',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
      },
      isSelf: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // 发送到WebSocket
    console.log('发送消息:', {
      type: 'GROUP_CHAT',
      dialogId: "1920783225209827330",
      groupId: "1920783225209827330",
      textContent: inputMessage,
      clientMessageId: 'client-msg-' + Date.now(),
    });
    sendMessage(
      JSON.stringify({
        type: 'GROUP_CHAT',
        dialogId: "1920783225209827330",
        groupId: "1920783225209827330",
        textContent: inputMessage,
        clientMessageId: 'client-msg-' + Date.now(),
      })
    );

    // 滚动到底部
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputMessage, sendMessage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // 处理图片发送
      const newMessage = {
        content: '图片消息',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        user: {
          name: 'Rhea',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
        },
        isSelf: true,
        image: result.assets[0].uri,
      };

      setMessages(prev => [...prev, newMessage]);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('开始录音失败:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      // 处理语音消息发送
      if (uri) {
        const newMessage = {
          content: '语音消息',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          user: {
            name: 'Rhea',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
          },
          isSelf: true,
          audio: uri,
        };

        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error('停止录音失败:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}>
      <View className="flex-1 bg-[#f5f8fc]">
        {/* 头部 */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="absolute left-4 z-10">
            <Ionicons name="chevron-back" size={24} color="#666" />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-medium">聊天广场</Text>
        </View>

        {/* 消息区域 */}
        <View className="flex-1">
          <Text className="px-4 py-2 text-center text-sm text-[#757575]">
            欢迎来到聊天广场，请文明发言！
          </Text>
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
            {messages.map((msg, index) => (
              <MessageItem key={index} {...msg} />
            ))}
          </ScrollView>
        </View>

        {/* 底部输入框和工具栏 */}
        <View style={{ paddingBottom: insets.bottom + 20 || 20 }} className="p-4">
          <View className="flex-row items-center">
            <View
              style={{
                boxShadow: '0px 4px 4px 0px rgba(82, 100, 255, 0.10)',
              }}
              className="flex-1 flex-row items-center rounded-[12px] bg-white px-6 py-3">
              <TextInput
                className="flex-1"
                placeholder="请输入消息..."
                placeholderTextColor="#999"
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSendMessage}
                onFocus={() => {
                  setIsKeyboardVisible(true);
                  setShowToolbar(false);
                }}
              />
              <Pressable onPress={handleSendMessage}>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
                  <Ionicons name="arrow-up" size={20} color="#fff" />
                </View>
              </Pressable>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setShowToolbar(!showToolbar);
                setIsKeyboardVisible(false);
              }}
              className="ml-2">
              <Ionicons name="add-circle" size={32} color="#1483FD" />
            </TouchableOpacity>
          </View>

          {/* 工具栏 */}
          {showToolbar && (
            <View className="mt-2 flex-row justify-around rounded-lg bg-white p-4">
              <TouchableOpacity 
                onPress={pickImage}
                className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="image" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">图片</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={isRecording ? stopRecording : startRecording}
                className="items-center">
                <View className={`h-12 w-12 items-center justify-center rounded-full ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Ionicons 
                    name={isRecording ? "mic" : "mic-outline"} 
                    size={24} 
                    color={isRecording ? "#FF0000" : "#1483FD"} 
                  />
                </View>
                <Text className="mt-1 text-xs text-gray-600">
                  {isRecording ? '松开结束' : '按住说话'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
