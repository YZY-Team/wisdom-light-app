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
import { fileApi } from '~/api/who/file';
import { dialogApi } from '~/api/have/dialog';
import MessageItem, { MessageProps, AudioProvider } from '~/app/components/MessageItem';

type GroupMember = {
  userId: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
};

type WebSocketMessage = {
  type: string;
  dialogId: string;
  textContent: string;
  senderId: string;
  timestamp: string;
  status?: string;
  imageUrl?: string;
  audioUrl?: string;
  messageId?: string;
  readBy?: string;
};

type GroupMemberResponse = {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isOnline: boolean;
};

// 使用导入的MessageItem组件
const MessageItemWithPopupControl = (props: MessageProps) => <MessageItem {...props} />;

export default function GroupChat() {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { groupName, dialogId, groupAvatarUrl } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState('');
  const headerHeight = useHeaderHeight();

  // 新增的状态
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // 模拟群成员数据
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // WebSocket 上下文
  const { sendMessage, lastMessage } = useWebSocketContext();

  // 从 Zustand store 获取消息和添加消息的方法
  const { addMessage } = useWebSocketStore();
  const messages = useWebSocketStore((state) => state.messages);
  const chatMessages = messages[String(dialogId)] || [];
  console.log('当前对话ID:', dialogId);
  console.log('所有消息键:', Object.keys(messages));
  console.log('当前对话消息数量:', chatMessages.length);

  // 添加 FlashList 的引用
  const flashListRef = useRef<FlashList<any>>(null);

  // 添加分页状态
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  // 优化消息获取逻辑
  const visibleMessages = useMemo(() => {
    if (!chatMessages.length) return [];
    // 由于不再使用 inverted 属性，我们需要确保消息按时间顺序排列（旧的在上，新的在下）
    const messages = [...chatMessages];
    const start = Math.max(0, messages.length - page * PAGE_SIZE);
    return messages.slice(start);
  }, [chatMessages, page]);

  const formattedMessages = useMemo(() => {
    return visibleMessages.map((msg) => {
      const isSelf = msg.senderId === userInfo?.globalUserId;

      // 解析消息内容
      let content = '';
      let imageUrl;
      let audioUrl;
      let nickname = '';
      let avatar = '';

      try {
        const parsedContent = JSON.parse(msg.textContent);
        console.log('解析的消息内容:', new Date().toLocaleString(), parsedContent);
        if (parsedContent.type === 'text') {
          content = parsedContent.text;
          nickname = parsedContent.nickname || '未知用户';
          avatar =
            parsedContent.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
        } else if (parsedContent.type === 'image') {
          content = '[图片消息]';
          imageUrl = parsedContent.url;
          nickname = parsedContent.nickname || '未知用户';
          avatar =
            parsedContent.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
        } else if (parsedContent.type === 'audio') {
          content = '[语音消息]';
          audioUrl = parsedContent.url;
          nickname = parsedContent.nickname || '未知用户';
          avatar =
            parsedContent.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
        }
      } catch (error) {
        console.error('消息内容解析失败:', error, msg.textContent);
        content = msg.textContent;
        nickname = '未知用户';
        avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
      }

      // 格式化时间
      const time = new Date(Number(msg.timestamp)).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 计算已读状态
      const readCount = msg.readBy?.length || 0;
      const isRead = isSelf && readCount > 1; // 自己的消息至少有一个其他人已读
      const readStatus = isSelf ? (isRead ? `${readCount - 1}人已读` : '未读') : '';

      const messageProps: MessageProps = {
        content,
        time,
        user: {
          name: isSelf ? '我' : nickname,
          avatar: isSelf ? userInfo?.avatarUrl || avatar : avatar,
        },
        isSelf,
        imageUrl,
        audioUrl,
        messageId: `${msg.senderId}-${msg.timestamp}`, // 添加唯一ID
        readStatus, // 添加已读状态
      };

      return messageProps;
    });
  }, [visibleMessages, userInfo?.globalUserId, userInfo?.avatarUrl]);

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [loading]);

  // WebSocket 消息处理
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data) as WebSocketMessage;
        // 只处理当前对话的消息
        console.log('收到WebSocket消息:', new Date().toLocaleString(), data);
        if (data.type === 'GROUP_CHAT' && data.dialogId === dialogId) {
          // 解析消息内容
          try {
            const parsedContent = JSON.parse(data.textContent);
            console.log('解析后的消息内容:', new Date().toLocaleString(), parsedContent);

            // 构造完整的消息对象
            const newMessage: Message = {
              type: 'GROUP_CHAT',
              dialogId: data.dialogId,
              senderId: data.senderId,
              textContent: data.textContent,
              timestamp: data.timestamp,
              status: 'READ',
            };

            // 只有当消息不是自己发送的时候才添加到store
            if (data.senderId !== userInfo?.globalUserId) {
              console.log('添加其他人的消息到store:', new Date().toLocaleString(), newMessage);
              addMessage(newMessage);

              // 发送已读回执
              if (userInfo?.globalUserId) {
                const readReceiptMessage = {
                  type: 'READ_RECEIPT',
                  dialogId: dialogId as string,
                  messageId: `${data.senderId}-${data.timestamp}`, // 使用相同的消息ID格式
                  readBy: userInfo.globalUserId,
                };
                console.log('发送已读回执:', new Date().toLocaleString(), readReceiptMessage);
                sendMessage(JSON.stringify(readReceiptMessage));
                
                // 立即标记该消息为已读
                const { markMessagesAsRead } = useWebSocketStore.getState();
                markMessagesAsRead(dialogId as string, userInfo.globalUserId);
              }
            } else {
              console.log('跳过自己发送的消息，避免重复:', new Date().toLocaleString(), newMessage);
            }
          } catch (error) {
            console.log('解析消息内容失败:', error);
          }
        } else if (data.type === 'READ_RECEIPT' && data.dialogId === dialogId) {
          // 处理已读回执
          console.log('收到已读回执:', new Date().toLocaleString(), data);
          if (data.messageId && data.readBy && userInfo?.globalUserId) {
            // 从 WebSocketStore 获取 markMessagesAsRead 方法
            const { markMessagesAsRead } = useWebSocketStore.getState();
            // 标记指定消息为已读
            markMessagesAsRead(dialogId as string, data.readBy);
          }
        } else {
          console.log('消息不匹配当前对话:', {
            messageType: data.type,
            messageDialogId: data.dialogId,
            currentDialogId: dialogId,
            timestamp: new Date().toLocaleString(),
          });
        }
      } catch (error) {
        console.log('解析消息失败:', error);
      }
    }
  }, [lastMessage, dialogId, addMessage, userInfo?.globalUserId, sendMessage]);

  // 发送消息处理
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !dialogId) return;

    const timestamp = String(Date.now());
    const textContent = JSON.stringify({
      type: 'text',
      text: inputMessage,
      avatar:
        userInfo?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
      nickname: userInfo?.nickname || 'Me',
    });

    // WebSocket消息格式
    const wsMessage = {
      type: 'GROUP_CHAT',
      dialogId: dialogId as string,
      textContent: textContent,
    };
    console.log('发送消息:', new Date().toLocaleString(), wsMessage);

    // 发送到WebSocket
    sendMessage(JSON.stringify(wsMessage));

    // 本地store消息格式
    const storeMessage: Message = {
      type: 'GROUP_CHAT',
      dialogId: dialogId as string,
      senderId: userInfo!.globalUserId,
      textContent: textContent,
      timestamp: timestamp,
      status: 'READ',
    };

    // 直接添加到store，不等待WebSocket回调
    console.log('添加自己的消息到store:', new Date().toLocaleString(), storeMessage);
    addMessage(storeMessage);

    setInputMessage('');
  }, [inputMessage, sendMessage, dialogId, userInfo, addMessage]);

  // 获取群成员列表
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const response = await dialogApi.getGroupMembers(dialogId as string);
        if (response && response.data) {
          const memberList = response.data as GroupMemberResponse[];
          const members: GroupMember[] = memberList.map((member) => ({
            userId: member.userId,
            name: member.nickname || '未知用户',
            avatar:
              member.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`,
          }));
          setGroupMembers(members);
        }
      } catch (error) {
        console.error('获取群成员列表失败:', error);
      }
    };

    if (dialogId) {
      fetchGroupMembers();
    }
  }, [dialogId]);

  // 进入群聊时标记消息为已读
  useEffect(() => {
    if (dialogId && userInfo?.globalUserId) {
      // 从 WebSocketStore 获取 markMessagesAsRead 方法
      const { markMessagesAsRead } = useWebSocketStore.getState();
      // 标记当前对话中的所有消息为已读
      markMessagesAsRead(dialogId as string, userInfo.globalUserId);
    }
  }, [dialogId, userInfo?.globalUserId]);

  const renderItem = useCallback(
    ({ item }: { item: MessageProps }) => <MessageItemWithPopupControl {...item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: MessageProps) => item.messageId || `${item.user.name}-${item.time}-${Math.random()}`,
    []
  );

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
          const textContent = JSON.stringify({
            type: 'image',
            url: response.data.url,
            nickname: userInfo?.nickname || 'Me',
            avatar: userInfo?.avatarUrl || '',
          });

          // WebSocket消息格式
          const wsMessage = {
            type: 'GROUP_CHAT',
            dialogId: dialogId as string,
            textContent: textContent,
          };

          // 发送到WebSocket
          sendMessage(JSON.stringify(wsMessage));

          // 本地store消息格式
          const storeMessage: Message = {
            type: 'GROUP_CHAT',
            dialogId: dialogId as string,
            senderId: userInfo!.globalUserId,
            textContent: textContent,
            timestamp: String(Date.now()),
            status: 'READ',
          };

          // 保存消息到 store
          addMessage(storeMessage);

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

      if (response.code === 200 && response.data) {
        const textContent = JSON.stringify({
          type: 'audio',
          url: response.data.url,
          nickname: userInfo?.nickname || 'Me',
          avatar: userInfo?.avatarUrl || '',
        });

        // WebSocket消息格式
        const wsMessage = {
          type: 'GROUP_CHAT',
          dialogId: dialogId as string,
          textContent: textContent,
        };

        // 发送到WebSocket
        sendMessage(JSON.stringify(wsMessage));

        // 本地store消息格式
        const storeMessage: Message = {
          type: 'GROUP_CHAT',
          dialogId: dialogId as string,
          senderId: userInfo!.globalUserId,
          textContent: textContent,
          timestamp: String(Date.now()),
          status: 'READ',
        };

        // 保存消息到 store
        addMessage(storeMessage);

        // 收起工具栏
        setShowToolbar(false);
      }
    } catch (err) {
      console.error('停止录音失败:', err);
    }
  };

  // 渲染消息列表
  const renderMessageList = () => (
    <AudioProvider>
      <FlashList
        inverted
        ref={flashListRef}
        data={[...formattedMessages].reverse()}
        renderItem={({ item }: { item: MessageProps }) => <MessageItemWithPopupControl {...item} />}
        keyExtractor={(item, index) => `${item.messageId || index}`}
        estimatedItemSize={100}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </AudioProvider>
  );

  return (
    <KeyboardAvoidingView className="flex-1" behavior={'padding'} keyboardVerticalOffset={0}>
      <View className="flex-1 bg-[#1483fd]/10 py-3">
        {/* 头部导航栏 */}
        <View
          className="flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top }}>
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="#666" />
          </Pressable>

          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-medium">{groupName}</Text>
          </View>

          <Pressable
            onPress={() => {
              router.push({
                pathname: `/group-chat/${dialogId}/info`,
                params: { groupName, groupAvatarUrl },
              });
            }}
            className="h-12 w-12 items-center justify-center">
            <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          </Pressable>
        </View>

        {/* 消息区域 */}
        <View className="flex-1">{renderMessageList()}</View>

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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
