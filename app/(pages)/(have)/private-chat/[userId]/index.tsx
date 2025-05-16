import { View, Text, Pressable, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { Message, useWebSocketStore } from '~/store/websocketStore';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUserStore } from '~/store/userStore';
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { cancelCall } from '~/api/have/dialog';
import { fileApi } from '~/api/who/file';
import { useFriendDetail } from '~/queries/friend';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Keyboard } from 'react-native';

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

export default function PrivateChat() {
  const insets = useSafeAreaInsets();
  const userInfo = useUserStore((state) => state.userInfo);
  const { dialogId, userName, targetUserId } = useLocalSearchParams();
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
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  // 音频播放状态
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // 从 Zustand store 获取消息
  const storeMessages = useWebSocketStore((stats) => stats.messages);
  const chatMessages = storeMessages[String(dialogId)] || [];

  // WebSocket 上下文
  const { sendMessage, lastMessage } = useWebSocketContext();

  // 获取 markMessagesAsRead 函数
  const { markMessagesAsRead, addMessage } = useWebSocketStore();

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

  // 获取头像URL，优先使用真实头像，没有则使用默认头像
  const getAvatarUrl = useCallback(
    (senderId: string) => {
      // 如果是当前用户
      if (senderId === userInfo?.globalUserId) {
        return userInfo?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
      }
      // 如果是好友
      else if (senderId === targetUserId && friendInfo) {
        // 优先使用自定义头像，其次使用原始头像，最后使用默认头像
        return (
          friendInfo.customAvatarUrl ||
          friendInfo.avatarUrl ||
          friendInfo.originalAvatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`
        );
      }
      // 默认头像
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
    },
    [userInfo, friendInfo, targetUserId]
  );

  // 加载历史消息
  useEffect(() => {
    if (chatMessages.length > 0 && messages.length === 0) {
      // 将store中的消息转换为GiftedChat格式
      const formattedMessages = chatMessages.map((msg, index) => {
        const isSelf = msg.senderId === userInfo?.globalUserId;

        // 解析消息内容
        let text = '';
        let image;
        let audio;

        try {
          const parsedContent = JSON.parse(msg.textContent);
          if (parsedContent.type === 'text') {
            text = parsedContent.text;
          } else if (parsedContent.type === 'image') {
            text = '[图片消息]';
            image = parsedContent.url;
          } else if (parsedContent.type === 'audio') {
            text = '[语音消息]';
            audio = parsedContent.url;
          } else {
            // 默认情况，直接显示文本内容
            text = msg.textContent;
          }
        } catch (error) {
          // 如果解析失败，直接显示原始内容
          text = msg.textContent;
        }

        // 确保每条消息有唯一ID，添加随机数和索引
        const uniqueId = `${msg.senderId}-${msg.timestamp}-${index}-${Math.random().toString(36).substring(2, 10)}`;

        const newMessage: IMessage = {
          _id: uniqueId,
          text,
          createdAt: new Date(Number(msg.timestamp)),
          user: {
            _id: msg.senderId,
            name: isSelf ? '我' : (userName as string),
            avatar: getAvatarUrl(msg.senderId),
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
  }, [chatMessages, userInfo?.globalUserId, messages.length, userName, getAvatarUrl]);

  // WebSocket 消息处理
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        // 只处理当前对话的消息
        if (data.type === 'PRIVATE_CHAT' && data.dialogId === dialogId) {
          // 如果消息不是自己发送的，则添加到GiftedChat消息列表
          if (data.senderId !== userInfo?.globalUserId) {
            // 解析消息内容
            let text = '';
            let image;
            let audio;

            try {
              const parsedContent = JSON.parse(data.textContent);
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
            } catch (error) {
              text = data.textContent;
            }

            // 使用更复杂的唯一ID生成方式
            const uniqueId = `${data.senderId}-${data.timestamp}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

            const giftedMessage: IMessage = {
              _id: uniqueId,
              text,
              createdAt: new Date(Number(data.timestamp)),
              user: {
                _id: data.senderId,
                name: userName as string,
                avatar: getAvatarUrl(data.senderId),
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
        }
      } catch (error) {
        console.log('解析消息失败:', error);
      }
    }
  }, [lastMessage, dialogId, userInfo?.globalUserId, userName, getAvatarUrl]);

  // 发送消息处理
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const message = newMessages[0];
      const textContent = JSON.stringify({
        type: 'text',
        text: message.text,
      });
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

      setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    },
    [dialogId, sendMessage, addMessage, userInfo, targetUserId]
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

          // 添加本地消息
          const giftedMessage: IMessage = {
            _id: randomId,
            text: '[图片消息]',
            createdAt: new Date(),
            user: {
              _id: userInfo?.globalUserId || '',
              name: '我',
              avatar: getAvatarUrl(userInfo?.globalUserId || ''),
            },
            image: response.data.url,
          };

          setMessages((previousMessages) => GiftedChat.append(previousMessages, [giftedMessage]));

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
          _id: userInfo?.globalUserId || '',
          name: '我',
          avatar: getAvatarUrl(userInfo?.globalUserId || ''),
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
    <AudioContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      <KeyboardAvoidingView
        className="flex-1">
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
            <GiftedChat
              messageIdGenerator={() =>
                `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
              }
              messages={messages}
              onSend={onSend}
              user={{
                _id: userInfo?.globalUserId || '',
                name: '我',
                avatar: getAvatarUrl(userInfo?.globalUserId || ''),
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
              renderChatEmpty={() => renderChatEmpty({ loading, isGroupChat: false })}
            />
          </View>

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
      </KeyboardAvoidingView>
    </AudioContext.Provider>
  );
}
