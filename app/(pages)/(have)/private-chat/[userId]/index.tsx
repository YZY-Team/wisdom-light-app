import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { initiateCall } from '~/api/have/dialog';
import { cancelCall } from '~/api/have/dialog';
import { fileApi } from '~/api/who/file';
type MessageProps = {
  content: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  isSelf?: boolean;
  imageUrl?: string;
  audioUrl?: string;
};

const MessageItem = ({ content, time, user, isSelf, imageUrl, audioUrl }: MessageProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    if (!audioUrl) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await newSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放语音消息失败:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View className={`mb-4 flex-row ${isSelf ? 'flex-row-reverse' : ''}`}>
      <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" contentFit="cover" />
      <View className={`flex-1 ${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
        {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
        <View className={`max-w-[70%] rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="h-40 w-40 rounded-md" contentFit="cover" />
          ) : audioUrl ? (
            <TouchableOpacity onPress={playSound} className="flex-row items-center">
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={24}
                color={isSelf ? '#fff' : '#333'}
              />
              <Text className={`ml-2 ${isSelf ? 'text-white' : 'text-gray-800'}`}>
                {isPlaying ? '正在播放语音...' : '点击播放语音'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
          )}
        </View>
        <Text className="mt-1 text-xs text-gray-400">{time}</Text>
      </View>
    </View>
  );
};

export default function PrivateChat() {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { dialogId, userName, targetUserId } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState('');
  const headerHeight = useHeaderHeight();
  console.log('对方id', targetUserId);

  // 新增的状态
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>('');

  // 从 Zustand store 获取消息
  const messages = useWebSocketStore((stats) => stats.messages);

  const chatMessages = messages[String(dialogId)] || [];

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
        imageUrl: msg.imageUrl,
        audioUrl: msg.audioUrl,
      };
    });
  }, [visibleMessages, userInfo?.globalUserId, userName, formatTime, getAvatarUrl]);
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

  const renderItem = useCallback(
    ({ item }: { item: MessageProps }) => <MessageItem {...item} />,
    []
  );

  const keyExtractor = useCallback((item: any, index: number) => `${item.time}-${index}`, []);

  // 图片选择器
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'image.jpg';
        const randomId = Date.now().toString();
        const type = result.assets[0].mimeType || 'image/jpeg';

        // 上传图片
        const response = await fileApi.uploadImage({
          file: {
            uri,
            type,
            name: filename,
          },
          relatedId: randomId,
        });
        
        console.log('上传图片', response);
        
        if (response.code === 200 && response.data) {
          // 处理图片发送
          const newMessage: Message = {
            type: 'PRIVATE_CHAT',
            senderId: userInfo!.globalUserId,
            receiverId: targetUserId as string,
            dialogId: dialogId as string,
            textContent: '[图片消息]',
            timestamp: String(Date.now()),
            imageUrl: response.data.url,
          };

          // 发送消息
          sendMessage(JSON.stringify(newMessage));
          // 存储消息
          addMessage({ ...newMessage, status: 'READ' });
        } else {
          console.error('图片上传失败:', response);
        }
      } catch (error) {
        console.error('图片上传或发送失败:', error);
      }
    }
  };

  // 语音录制
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
        const newMessage: Message = {
          type: 'PRIVATE_CHAT',
          senderId: userInfo!.globalUserId,
          receiverId: targetUserId as string,
          dialogId: dialogId as string,
          textContent: '[语音消息]',
          timestamp: String(Date.now()),
          audioUrl: uri,
        };

        // 发送消息
        sendMessage(JSON.stringify(newMessage));
        // 存储消息
        addMessage({ ...newMessage, status: 'READ' });
      }
    } catch (err) {
      console.error('停止录音失败:', err);
    }
  };

  // 语音通话
  const handleVoiceCall = () => {
    // 处理语音通话逻辑
    setShowVoiceCallModal(true);

    // 调用语音通话API
    initiateCall({
      callerId: Number(userInfo?.globalUserId),
      receiverId: Number(targetUserId),
      callType: 'AUDIO',
    }).then(res => {
      if (res.code === 200) {
        console.log('语音通话', res);
        setCurrentCallId(res.data.callId);
      }
    });
  };

  // 视频通话
  const handleVideoCall = () => {
    // 处理视频通话逻辑
    setShowVideoCallModal(true);

    // 调用视频通话API
    initiateCall({
      callerId: userInfo!.globalUserId,
      receiverId: targetUserId as string,
      callType: 'VIDEO',
    }).then(res => {
      if (res.code === 200) {
        setCurrentCallId(res.data.callId);
        console.log('视频通话', res);
      }
    }).catch(err=>{
      console.log('视频通话失败',err);
    });
  };

  // 处理挂断通话
  const handleEndCall = async () => {
    if (currentCallId) {
      try {
        await cancelCall(currentCallId);
        setShowVoiceCallModal(false);
        setShowVideoCallModal(false);
        setCurrentCallId('');
      } catch (error) {
        console.error('挂断通话失败:', error);
      }
    } else {
      setShowVoiceCallModal(false);
      setShowVideoCallModal(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={'padding'} keyboardVerticalOffset={0}>
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
              className="flex-1 flex-row items-center rounded-[12px] bg-white px-6 py-3">
              <TextInput
                className="flex-1"
                placeholder="请输入消息..."
                placeholderTextColor="#999"
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                multiline={false}
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
            {/* <TouchableOpacity
              onPress={() => {
                setShowToolbar(!showToolbar);
                setIsKeyboardVisible(false);
              }}
              className="ml-2">
              <Ionicons name="add-circle" size={32} color="#1483FD" />
            </TouchableOpacity> */}
          </View>

          {/* 工具栏 */}
          {showToolbar && (
            <View className="mt-2 flex-row justify-around rounded-lg bg-white p-4">
              <TouchableOpacity onPress={pickImage} className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="image" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">图片</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className="items-center">
                <View
                  className={`h-12 w-12 items-center justify-center rounded-full ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Ionicons
                    name={isRecording ? 'mic' : 'mic-outline'}
                    size={24}
                    color={isRecording ? '#FF0000' : '#1483FD'}
                  />
                </View>
                <Text className="mt-1 text-xs text-gray-600">
                  {isRecording ? '松开结束' : '按住说话'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleVoiceCall} className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="call" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">语音聊天</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleVideoCall} className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="videocam" size={24} color="#1483FD" />
                </View>
                <Text className="mt-1 text-xs text-gray-600">视频聊天</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 语音通话模态框 */}
          {showVoiceCallModal && (
            <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black">
              <View className="h-full w-full items-center justify-center">
                <View className="items-center">
                  <Image
                    source={{ uri: getAvatarUrl(targetUserId as string) }}
                    className="h-32 w-32 rounded-full"
                    contentFit="cover"
                  />
                  <Text className="mt-4 text-2xl font-medium text-white">{userName}</Text>
                  <Text className="mt-2 text-base text-white/70">语音通话中...</Text>
                  <Text className="mt-1 text-sm text-white/50">通话时间: 00:00</Text>
                </View>
                <View className="absolute bottom-20 w-full flex-row justify-center space-x-8">
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-4">
                    <Ionicons name="mic-off" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEndCall}
                    className="items-center rounded-full bg-red-500 p-4">
                    <Ionicons name="call" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-4">
                    <Ionicons name="volume-high" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 视频通话模态框 */}
          {showVideoCallModal && (
            <View className="absolute bottom-0 left-0 right-0 top-0 bg-black">
              <View className="absolute right-4 top-12 h-48 w-36 overflow-hidden rounded-2xl bg-gray-300">
                <Image
                  source={{ uri: getAvatarUrl(userInfo?.globalUserId || '') }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              </View>
              <View className="h-full w-full items-center justify-center">
                <Image
                  source={{ uri: getAvatarUrl(targetUserId as string) }}
                  className="h-full w-full"
                  contentFit="cover"
                  style={{ opacity: 0.9 }}
                />
                <View className="absolute top-16 w-full items-center">
                  <Text className="text-2xl font-medium text-white">{userName}</Text>
                  <Text className="mt-2 text-base text-white/70">视频通话中...</Text>
                </View>
                <View className="absolute bottom-20 w-full flex-row justify-center space-x-8">
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-4">
                    <Ionicons name="mic-off" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEndCall}
                    className="items-center rounded-full bg-red-500 p-4">
                    <Ionicons name="call" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center rounded-full bg-white/20 p-4">
                    <Ionicons name="camera-reverse" size={32} color="#fff" />
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
