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
import { dialogApi } from '~/api/have/dialog';
import { FlashList } from '@shopify/flash-list';
import MessageItem, { MessageProps, AudioProvider } from '~/app/components/MessageItem';
import { fileApi } from '~/api/who/file';
import { useUserStore } from '~/store/userStore';

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  const [inputMessage, setInputMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, lastMessage } = useWebSocketContext();
  const userInfo = useUserStore((state) => state.userInfo);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [dialogId, setDialogId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 加入聊天广场
  useEffect(() => {
    const joinSquare = async () => {
      try {
        setLoading(true);
        const response = await dialogApi.joinChatSquare();
        if (response && response.data) {
          console.log('加入聊天广场成功:', response.data);
          setDialogId(response.data.toString());
        }
      } catch (error) {
        console.error('加入聊天广场失败:', error);
      } finally {
        setLoading(false);
      }
    };

    joinSquare();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        // 只处理当前对话的消息
        console.log('data', data, dialogId);
        if (data.type === 'GROUP_CHAT' && data.dialogId === dialogId) {
          let content = '';
          let imageUrl: string | undefined;
          let audioUrl: string | undefined;
          let parsedContent = JSON.parse(data.textContent);
          try {
            if (parsedContent.type === 'text') {
              content = parsedContent.text;
            } else if (parsedContent.type === 'image') {
              content = '[图片消息]';
              imageUrl = parsedContent.url;
            } else if (parsedContent.type === 'audio') {
              content = '[语音消息]';
              audioUrl = parsedContent.url;
            } else {
              content = data.textContent;
            }
          } catch {
            content = data.textContent;
          }

          setMessages((prev) => [
            ...prev,
            {
              content,
              time: new Date(Number(data.timestamp)).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              user: {
                name: parsedContent.nickname || '未知用户',
                avatar:
                  parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown`,
              },
              isSelf: false,
              imageUrl,
              audioUrl,
            },
          ]);
        }
      } catch (error) {
        console.log('解析消息失败:', error);
      }
    }
  }, [lastMessage, dialogId]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !dialogId) return;

    const textContent = JSON.stringify({
      type: 'text',
      text: inputMessage,
      avatar:
        userInfo?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
      nickname: userInfo?.nickname || 'Me',
    });

    const newMessage = {
      content: inputMessage,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      user: {
        name: userInfo?.nickname || 'Me',
        avatar:
          userInfo?.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
      },
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // 发送到WebSocket
    sendMessage(
      JSON.stringify({
        type: 'GROUP_CHAT',
        dialogId: dialogId,
        textContent: textContent,
      })
    );
  }, [inputMessage, sendMessage, dialogId, userInfo]);

  // 使用导入的MessageItem组件
  const MessageItemWithPopupControl = (props: MessageProps) => <MessageItem {...props} />;

  // 渲染消息列表
  const renderMessageList = () => (
    <AudioProvider>
      <FlashList
        data={[...messages].reverse()}
        renderItem={({ item, index }: { item: MessageProps; index: number }) => (
          <MessageItemWithPopupControl 
            {...item}
            messageId={`square_${index}_${item.time}`}
          />
        )}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        estimatedItemSize={100}
        contentContainerStyle={{ padding: 16 }}
        inverted
      />
    </AudioProvider>
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
            avatar:
              userInfo?.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
            nickname: userInfo?.nickname || 'Me',
          });

          // 添加本地消息
          const newMessage = {
            content: '[图片消息]',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            user: {
              name: userInfo?.nickname || 'Me',
              avatar:
                userInfo?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
            },
            isSelf: true,
            imageUrl: response.data.url,
          };

          setMessages((prev) => [...prev, newMessage]);

          // 发送到WebSocket
          sendMessage(
            JSON.stringify({
              type: 'GROUP_CHAT',
              dialogId: dialogId,
              textContent: textContent,
            })
          );

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
          avatar:
            userInfo?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
          nickname: userInfo?.nickname || 'Me',
        });
        console.log('准备发送语音消息:', textContent);

        // 添加本地消息
        const newMessage = {
          content: '[语音消息]',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          user: {
            name: userInfo?.nickname || 'Me',
            avatar:
              userInfo?.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
          },
          isSelf: true,
          audioUrl: response.data.url,
        };

        setMessages((prev) => [...prev, newMessage]);

        // 发送到WebSocket
        sendMessage(
          JSON.stringify({
            type: 'GROUP_CHAT',
            dialogId: dialogId,
            textContent: textContent,
          })
        );

        // 收起工具栏
        setShowToolbar(false);
      }
    } catch (err) {
      console.error('停止录音失败:', err);
    }
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={0} style={{ flex: 1 }}>
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
            {loading ? '正在加入聊天广场...' : '欢迎来到聊天广场，请文明发言！'}
          </Text>
          {renderMessageList()}
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
