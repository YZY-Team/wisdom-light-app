import { View, Text, TextInput, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { Message, useWebSocketStore } from '~/store/websocketStore';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '~/store/userStore';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { cancelCall } from '~/api/have/dialog';
import { fileApi } from '~/api/who/file';
import MessageItem, { MessageProps } from '~/app/components/MessageItem';
import { useFriendDetail } from '~/queries/friend';

export default function PrivateChat() {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { dialogId, userName, targetUserId } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState('');
  const headerHeight = useHeaderHeight();
  console.log('对方id', targetUserId);

  // 获取好友详情
  const { data: friendData, isLoading: friendLoading } = useFriendDetail(targetUserId as string);
  const [friendInfo, setFriendInfo] = useState<any>(null);

  // 当好友详情加载完成时更新状态
  useEffect(() => {
    if (friendData && !friendLoading) {
      setFriendInfo(friendData.data);
    }
  }, [friendData, friendLoading]);
  
  // 新增的状态
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>('');
  // 添加新状态用于全局遮罩层
  const [showGlobalOverlay, setShowGlobalOverlay] = useState(false);

  // 从 Zustand store 获取消息
  const messages = useWebSocketStore((stats) => stats.messages);

  const chatMessages = messages[String(dialogId)] || [];

  // WebSocket 上下文
  const { sendMessage } = useWebSocketContext();

  // 获取 markMessagesAsRead 函数
  const { markMessagesAsRead } = useWebSocketStore();

  // 监听新消息并自动标记已读
  useEffect(() => {
    const unsubscribe = useWebSocketStore.subscribe((state, prevState) => {
      // 获取当前对话的消息
      const currentDialogMessages = state.messages[String(dialogId)] || [];
      const prevDialogMessages = prevState.messages[String(dialogId)] || [];

      // 如果有新消息（当前消息数量大于之前的消息数量）
      if (currentDialogMessages.length > prevDialogMessages.length) {
        // 找出新消息
        const newMessages = currentDialogMessages.filter(
          (msg) => !prevDialogMessages.some((prevMsg) => prevMsg.timestamp === msg.timestamp)
        );

        // 如果有新消息且不是自己发送的，则标记为已读
        const hasUnreadMessages = newMessages.some(
          (msg) => msg.senderId !== userInfo?.globalUserId
        );

        if (hasUnreadMessages) {
          markMessagesAsRead(String(dialogId), String(targetUserId));
        }
      }
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [dialogId, targetUserId, userInfo?.globalUserId, markMessagesAsRead]);

  // 全局关闭操作浮窗的函数
  const closeAllActionPopups = () => {
    setShowGlobalOverlay(false);
  };


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

  // 获取头像URL，优先使用真实头像，没有则使用默认头像
  const getAvatarUrl = useCallback((senderId: string) => {
    // 如果是当前用户
    if (senderId === userInfo?.globalUserId) {
      return userInfo?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
    } 
    // 如果是好友
    else if (senderId === targetUserId && friendInfo) {
      // 优先使用自定义头像，其次使用原始头像，最后使用默认头像
      return friendInfo.customAvatarUrl || friendInfo.avatarUrl || friendInfo.originalAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
    }
    // 默认头像
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
  }, [userInfo, friendInfo, targetUserId]);

  // 移除其他重复的性能统计代码
  // 发送消息
  const { addMessage } = useWebSocketStore();

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;
    const textContent = JSON.stringify({
      type: 'text',
      text: inputMessage,
    });
    const newMessage: Message = {
      type: 'PRIVATE_CHAT',
      senderId: userInfo!.globalUserId,
      receiverId: targetUserId as string,
      dialogId: dialogId as string,
      textContent: textContent,
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

      // 解析消息内容
      let content = '';
      let imageUrl;
      let audioUrl;

      try {
        const parsedContent = JSON.parse(msg.textContent);
        console.log('解析消息内容:', { parsedContent, isSelf, senderId: msg.senderId, myId: userInfo?.globalUserId });

        if (parsedContent.type === 'text') {
          content = parsedContent.text;
        } else if (parsedContent.type === 'image') {
          content = '[图片消息]';
          imageUrl = parsedContent.url;
        } else if (parsedContent.type === 'audio') {
          content = '[语音消息]';
          audioUrl = parsedContent.url;
          console.log('识别到语音消息:', { audioUrl, isSelf });
        } else {
          // 默认情况，直接显示文本内容
          content = msg.textContent;
        }
      } catch (error) {
        // 如果解析失败，直接显示原始内容
        content = msg.textContent;
        console.warn('消息解析失败:', { content, error });
      }

      return {
        content,
        time,
        user: {
          name: isSelf ? '我' : (userName as string),
          avatar: getAvatarUrl(msg.senderId),
        },
        isSelf,
        imageUrl,
        audioUrl,
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

  // 使用导入的MessageItem组件，传递全局控制函数
  const MessageItemWithPopupControl = (props: MessageProps) => (
    <MessageItem
      {...props}
    />
  );

  const renderItem = useCallback(
    ({ item }: { item: MessageProps }) => <MessageItemWithPopupControl {...item} />,
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
        const textContent = JSON.stringify({
          type: 'image',
          url: response.data.url,
        });
        if (response.code === 200 && response.data) {
          // 处理图片发送
          const newMessage: Message = {
            type: 'PRIVATE_CHAT',
            senderId: userInfo!.globalUserId,
            receiverId: targetUserId as string,
            dialogId: dialogId as string,
            textContent: textContent,
            timestamp: String(Date.now()),
          };

          // 发送消息
          sendMessage(JSON.stringify(newMessage));
          // 存储消息
          addMessage({ ...newMessage, status: 'READ' });
          // 收起工具栏
          setShowToolbar(false);
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
      console.log('录制的语音URI:', uri);

      setRecording(null);
      setIsRecording(false);
      const randomId = Date.now().toString();
      const response = await fileApi.uploadImage({
        file: {
          uri,
          type: 'audio/mpeg',
          name: 'audio.mp3',
        },
        relatedId: randomId,
      });
      console.log('上传语音响应:', response);

      // 处理语音消息发送
      if (response.code === 200 && response.data) {
        const textContent = JSON.stringify({
          type: 'audio',
          url: response.data.url,
        });
        console.log('准备发送语音消息:', textContent);
        
        const newMessage: Message = {
          type: 'PRIVATE_CHAT',
          senderId: userInfo!.globalUserId,
          receiverId: targetUserId as string,
          dialogId: dialogId as string,
          textContent: textContent,
          timestamp: String(Date.now()),
        };

        // 发送消息
        console.log('发送语音消息对象:', newMessage);
        sendMessage(JSON.stringify(newMessage));
        // 存储消息
        addMessage({ ...newMessage, status: 'READ' });
        // 收起工具栏
        setShowToolbar(false);
      }
    } catch (err) {
      console.error('停止录音失败:', err);
    }
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

        {/* 全局遮罩层，点击任何地方关闭浮窗 */}
        {showGlobalOverlay && (
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 40,
            }}
            onPress={closeAllActionPopups}
          />
        )}

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
