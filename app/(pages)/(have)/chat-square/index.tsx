import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useState, useCallback, useEffect, useRef } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
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
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);

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
        console.log('WebSocket 错误:', error);
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
        //   console.log('解析消息失败:', error);
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
    sendMessage(
      JSON.stringify({
        type: 'GROUP_CHAT',
        dialogId: 888888,
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

  const handleVoiceCall = () => {
    // 处理语音通话逻辑
    setShowVoiceCallModal(true);
    // 示例：添加一条语音通话消息
    const newMessage = {
      content: '发起了语音通话',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      user: {
        name: 'Rhea',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
      },
      isSelf: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleVideoCall = () => {
    // 处理视频通话逻辑
    setShowVideoCallModal(true);
    // 示例：添加一条视频通话消息
    const newMessage = {
      content: '发起了视频通话',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      user: {
        name: 'Rhea',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
      },
      isSelf: true,
    };
    setMessages(prev => [...prev, newMessage]);
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

              <TouchableOpacity 
                onPress={handleVoiceCall}
                className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="call" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">语音聊天</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleVideoCall}
                className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="videocam" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">视频聊天</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 语音通话模态框 */}
          {showVoiceCallModal && (
            <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/70">
              <View className="w-4/5 rounded-lg bg-white p-6">
                <Text className="mb-4 text-center text-lg font-medium">语音通话中...</Text>
                <View className="mb-6 items-center">
                  <Image 
                    source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea' }} 
                    className="h-20 w-20 rounded-full" 
                    contentFit="cover" 
                  />
                  <Text className="mt-2 text-gray-600">Rhea</Text>
                  <Text className="mt-1 text-sm text-gray-400">通话时间: 00:00</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowVoiceCallModal(false)}
                  className="items-center rounded-full bg-red-500 p-3">
                  <Ionicons name="call" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 视频通话模态框 */}
          {showVideoCallModal && (
            <View className="absolute bottom-0 left-0 right-0 top-0 bg-black">
              <View className="absolute right-4 top-4 h-32 w-24 overflow-hidden rounded-lg bg-gray-300">
                <Image 
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea' }} 
                  className="h-full w-full" 
                  contentFit="cover" 
                />
              </View>
              <View className="h-full w-full items-center justify-center">
                <Image 
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty' }} 
                  className="h-full w-full" 
                  contentFit="cover" 
                  style={{ opacity: 0.8 }}
                />
                <View className="absolute bottom-16 w-full flex-row justify-center space-x-8">
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-3">
                    <Ionicons name="mic-off" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setShowVideoCallModal(false)}
                    className="items-center rounded-full bg-red-500 p-3">
                    <Ionicons name="call" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-3">
                    <Ionicons name="camera-reverse" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
