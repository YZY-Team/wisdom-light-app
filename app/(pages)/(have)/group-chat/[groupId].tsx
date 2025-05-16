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
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { fileApi } from '~/api/who/file';
import { dialogApi } from '~/api/have/dialog';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 导入聊天组件
import { AudioContext } from '~/components/chat/AudioContext';
import { IAudioMessage } from '~/components/chat/types';
import renderMessage from '~/components/chat/MessageRenderer';
import renderBubble from '~/components/chat/ChatBubble';
import {
  renderSend,
  renderInputToolbar,
  renderComposer,
  renderActions,
} from '~/components/chat/InputComponents';
import renderChatEmpty from '~/components/chat/EmptyChat';
import ChatToolbar from '~/components/chat/ChatToolbar';

// 设置dayjs语言为中文
dayjs.locale('zh-cn');

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

export default function GroupChat() {
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { groupName, dialogId, groupAvatarUrl } = useLocalSearchParams();
  const headerHeight = useHeaderHeight();

  // 新增的状态
  const [isRecording, setIsRecording] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  // 音频播放状态
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // 模拟群成员数据
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // WebSocket 上下文
  const { sendMessage, lastMessage } = useWebSocketContext();

  // 从 Zustand store 获取消息和添加消息的方法
  const { addMessage } = useWebSocketStore();
  const storeMessages = useWebSocketStore((state) => state.messages);
  const chatMessages = storeMessages[String(dialogId)] || [];
  console.log('当前对话ID:', dialogId);
  console.log('所有消息键:', Object.keys(storeMessages));
  console.log('当前对话消息数量:', chatMessages.length);

  // 加载历史消息
  useEffect(() => {
    if (chatMessages.length > 0 && messages.length === 0) {
      // 将store中的消息转换为GiftedChat格式
      const formattedMessages = chatMessages.map((msg) => {
        const isSelf = msg.senderId === userInfo?.globalUserId;
        
        // 解析消息内容
        let text = '';
        let image;
        let audio;
        let nickname = '';
        let avatar = '';

        try {
          const parsedContent = JSON.parse(msg.textContent);
          if (parsedContent.type === 'text') {
            text = parsedContent.text;
            nickname = parsedContent.nickname || '未知用户';
            avatar = parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
          } else if (parsedContent.type === 'image') {
            text = '[图片消息]';
            image = parsedContent.url;
            nickname = parsedContent.nickname || '未知用户';
            avatar = parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
          } else if (parsedContent.type === 'audio') {
            text = '[语音消息]';
            audio = parsedContent.url;
            nickname = parsedContent.nickname || '未知用户';
            avatar = parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
          }
        } catch (error) {
          console.error('消息内容解析失败:', error, msg.textContent);
          text = msg.textContent;
          nickname = '未知用户';
          avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`;
        }

        const newMessage: IMessage = {
          _id: `${msg.senderId}-${msg.timestamp}`,
          text,
          createdAt: new Date(Number(msg.timestamp)),
          user: {
            _id: msg.senderId,
            name: nickname,
            avatar,
          },
        };

        if (image) {
          newMessage.image = image;
        }

        if (audio) {
          (newMessage as IAudioMessage).audio = audio;
        }

        return newMessage;
      });

      setMessages(formattedMessages);
      setLoading(false);
    }
  }, [chatMessages, userInfo?.globalUserId, messages.length]);

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
                  messageId: `${data.senderId}-${data.timestamp}`,
                  readBy: userInfo.globalUserId,
                };
                console.log('发送已读回执:', new Date().toLocaleString(), readReceiptMessage);
                sendMessage(JSON.stringify(readReceiptMessage));
                
                // 立即标记该消息为已读
                const { markMessagesAsRead } = useWebSocketStore.getState();
                markMessagesAsRead(dialogId as string, userInfo.globalUserId);
              }

              // 添加到GiftedChat消息列表
              let text = '';
              let image;
              let audio;

              if (parsedContent.type === 'text') {
                text = parsedContent.text;
              } else if (parsedContent.type === 'image') {
                text = '[图片消息]';
                image = parsedContent.url;
              } else if (parsedContent.type === 'audio') {
                text = '[语音消息]';
                audio = parsedContent.url;
              } else {
                text = data.textContent;
              }

              const giftedMessage: IMessage = {
                _id: `${data.senderId}-${data.timestamp}`,
                text,
                createdAt: new Date(Number(data.timestamp)),
                user: {
                  _id: data.senderId,
                  name: parsedContent.nickname || '未知用户',
                  avatar: parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.senderId}`,
                },
              };

              if (image) {
                giftedMessage.image = image;
              }

              if (audio) {
                (giftedMessage as IAudioMessage).audio = audio;
              }

              setMessages((previousMessages) => GiftedChat.append(previousMessages, [giftedMessage]));
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
  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      if (!dialogId) return;

      const message = messages[0];
      const timestamp = String(Date.now());

      const textContent = JSON.stringify({
        type: 'text',
        text: message.text,
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

      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    },
    [dialogId, sendMessage, userInfo, addMessage]
  );

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

          // 添加本地消息
          const newMessage: IMessage = {
            _id: randomId,
            text: '[图片消息]',
            createdAt: new Date(),
            user: {
              _id: userInfo?.globalUserId || 'Me',
              name: userInfo?.nickname || 'Me',
              avatar:
                userInfo?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
            },
            image: response.data.url,
          };

          setMessages((previousMessages) => GiftedChat.append(previousMessages, [newMessage]));

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

      if (!uri) return;

      // 显示上传中状态
      const randomId = Date.now().toString();

      // 添加临时本地消息表示上传中
      const tempMessage: IMessage = {
        _id: randomId,
        text: '[语音上传中...]',
        createdAt: new Date(),
        user: {
          _id: userInfo?.globalUserId || 'Me',
          name: userInfo?.nickname || 'Me',
          avatar:
            userInfo?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
        },
      };

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [tempMessage]));

      const randomId2 = Date.now().toString();
      const response = await fileApi.uploadImage({
        file: {
          uri,
          type: 'audio/mpeg',
          name: 'audio.mp3',
        },
        relatedId: randomId2,
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

        // 更新本地消息(替换临时消息)
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg._id === randomId
              ? ({
                  ...msg,
                  text: '[语音消息]',
                  audio: response.data.url,
                } as IAudioMessage)
              : msg
          );
          return updatedMessages;
        });

        // 收起工具栏
        setShowToolbar(false);
      } else {
        console.error('语音上传失败:', response);
        // 更新临时消息显示失败状态
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg._id === randomId
              ? {
                  ...msg,
                  text: '[语音上传失败]',
                }
              : msg
          );
          return updatedMessages;
        });
      }
    } catch (err) {
      console.error('停止录音失败:', err);
      setIsRecording(false);
      setRecording(null);
    }
  };

  // 处理录音按钮点击
  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <AudioContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      <KeyboardAvoidingView
       
        style={{ flex: 1 }}>
        <View className="flex-1 bg-[#f5f8fc]">
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

          {/* 加载提示 */}
          {loading && (
            <Text className="px-4 py-2 text-center text-sm text-[#757575]">
              正在加载消息...
            </Text>
          )}

          {/* GiftedChat 消息区域 */}
          <GiftedChat
            messageIdGenerator={() => Date.now().toString() + Math.random().toString()}
            messages={messages}
            onSend={onSend}
            user={{
              _id: userInfo?.globalUserId || 'Me',
              name: userInfo?.nickname || 'Me',
              avatar:
                userInfo?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
            }}
            placeholder="请输入消息..."
            renderSend={renderSend}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderComposer={renderComposer}
            renderActions={(props) => renderActions(props, () => setShowToolbar(!showToolbar))}
            renderAvatarOnTop
            showAvatarForEveryMessage
            alwaysShowSend
            scrollToBottomComponent={() => (
              <Ionicons name="chevron-down-circle" size={36} color="#1483FD" />
            )}
            isKeyboardInternallyHandled={true}
            inverted={true}
            locale="zh-cn"
            timeFormat="HH:mm"
            dateFormat="YYYY-MM-DD"
            minInputToolbarHeight={56}
            maxComposerHeight={120}
            bottomOffset={insets.bottom}
            renderUsernameOnMessage
            textInputProps={{
              multiline: true,
              returnKeyType: 'send',
            }}
            loadEarlier={false}
            renderChatFooter={() =>
              showToolbar ? (
                <ChatToolbar
                  isRecording={isRecording}
                  onPickImage={pickImage}
                  onToggleRecording={handleRecordingToggle}
                />
              ) : null
            }
            renderMessage={(props: any) => renderMessage(props)}
            renderChatEmpty={() => renderChatEmpty({ loading, isGroupChat: true })}
          />
        </View>
      </KeyboardAvoidingView>
    </AudioContext.Provider>
  );
}
