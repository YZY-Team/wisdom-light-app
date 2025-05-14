import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { useAudioPlayer, AudioModule, useAudioRecorder, AudioRecorder, RecordingPresets } from 'expo-audio';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { dialogApi } from '~/api/have/dialog';
import {
  GiftedChat,
  IMessage,
  Send,
  Bubble,
  InputToolbar,
  Composer,
  SendProps,
  BubbleProps,
  InputToolbarProps,
  ComposerProps,
  ActionsProps,
  MessageProps,
  MessageAudioProps,
} from 'react-native-gifted-chat';
import { fileApi } from '~/api/who/file';
import { useUserStore } from '~/store/userStore';
import { Platform, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置dayjs语言为中文
dayjs.locale('zh-cn');

// 创建音频上下文来管理当前播放的消息
const AudioContext = createContext<{
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
});

// 定义包含音频属性的消息接口
interface IAudioMessage extends IMessage {
  audio?: string;
}

// 自定义音频消息组件
const AudioMessage = ({
  currentMessage,
  position,
}: {
  currentMessage?: IAudioMessage;
  position?: 'left' | 'right';
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const { currentPlayingId, setCurrentPlayingId } = useContext(AudioContext);

  // 确定消息位置，根据提供的position
  const isUserMessage = position === 'right';
  
  // 检查当前消息是否正在播放
  const messageId = currentMessage?._id?.toString();
  const isThisPlaying = messageId && currentPlayingId === messageId;
  
  // 使用expo-audio的useAudioPlayer钩子
  const player = useAudioPlayer(
    currentMessage?.audio ? { uri: currentMessage.audio } : null
  );
  
  // 当全局播放ID变化时更新本地播放状态
  useEffect(() => {
    // 如果当前全局播放的不是这条消息，但本地状态显示正在播放，则停止播放
    if (messageId && currentPlayingId !== messageId && player.playing) {
      player.pause();
    }
  }, [currentPlayingId, messageId, player]);

  // 更新音频时长和当前播放时间
  useEffect(() => {
    if (player) {
      setDuration(player.duration);
      setCurrentTime(player.currentTime);
    }
  }, [player, player?.currentTime, player?.duration]);
  
  const playSound = async () => {
    try {
      if (!currentMessage?.audio || !messageId) return;
      
      // 如果已经在加载中，不要重复操作
      if (isLoading) return;

      // 如果有错误，重置错误状态
      if (loadError) setLoadError(null);
      
      // 如果当前有其他消息在播放，通知上下文切换播放ID
      if (currentPlayingId && currentPlayingId !== messageId) {
        console.log('切换播放ID', { from: currentPlayingId, to: messageId });
        setCurrentPlayingId(messageId);
      }
      
      // 设置音频模式
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false
      });

      // 播放或暂停
      if (player.playing) {
        player.pause();
        setCurrentPlayingId(null);
      } else {
        setIsLoading(true);
        try {
          await player.play();
          setCurrentPlayingId(messageId);
          setIsLoading(false);
        } catch (error) {
          console.error('播放失败:', error);
          setLoadError('播放失败，请重试');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('播放音频失败:', error);
      setLoadError('播放失败，请重试');
      setIsLoading(false);
      setCurrentPlayingId(null);
    }
  };

  // 监听播放状态
  useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
      if (status.didJustFinish) {
        setCurrentPlayingId(null);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [player, setCurrentPlayingId]);

  // 组件卸载时释放资源
  useEffect(() => {
    return () => {
      if (player && messageId === currentPlayingId) {
        player.pause();
        setCurrentPlayingId(null);
      }
    };
  }, [player, messageId, currentPlayingId, setCurrentPlayingId]);

  // 格式化时间为分:秒格式
  const formatTime = (timeInSeconds: number | null) => {
    if (timeInSeconds === null) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentMessage?.audio) return null;

  return (
    <TouchableOpacity
      onPress={playSound}
      disabled={isLoading}
      className={`my-1 flex-row items-center rounded-lg px-4 py-3 ${isUserMessage ? 'bg-[#1483FD]' : 'bg-white'}`}
      style={{ minWidth: 120 }}>
      {isLoading ? (
        <Ionicons name="ellipsis-horizontal" size={24} color={isUserMessage ? '#fff' : '#1483FD'} />
      ) : (
        <Ionicons
          name={isThisPlaying ? 'pause-circle' : 'play-circle'}
          size={24}
          color={isUserMessage ? '#fff' : '#1483FD'}
        />
      )}
      <View className={`ml-2 flex-1 ${isThisPlaying ? 'animate-pulse' : ''}`}>
        <View className="flex-row items-center">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`mx-0.5 rounded-full ${isUserMessage ? 'bg-white' : 'bg-[#1483FD]'}`}
              style={{
                width: 3 + i * 2,
                height: 4 + i * 2,
                opacity: isThisPlaying ? 0.5 + i * 0.1 : 0.3 + i * 0.1,
              }}
            />
          ))}
        </View>
        {loadError && (
          <Text className={`mt-1 text-xs ${isUserMessage ? 'text-red-200' : 'text-red-500'}`}>
            {loadError}
          </Text>
        )}
      </View>
      <Text className={`ml-2 text-xs ${isUserMessage ? 'text-white' : 'text-gray-600'}`}>
        {isThisPlaying 
          ? `${formatTime(currentTime)} / ${formatTime(duration)}` 
          : isLoading 
            ? '加载中...' 
            : duration 
              ? formatTime(duration)
              : '语音消息'}
      </Text>
    </TouchableOpacity>
  );
};

// 自定义Slack风格消息组件
const renderMessage = (props: any) => {
  const { currentMessage, previousMessage, nextMessage, user } = props;
  
  // 如果currentMessage不存在，则返回空视图而不是null
  if (!currentMessage) return <View />;
  
  console.log('previousMessage', previousMessage, 'currentMessage', currentMessage);
  
  // 检查是否是同一个用户的连续消息
  const isSameUser = previousMessage && previousMessage.user && 
    previousMessage.user._id === currentMessage.user._id;
  
  // 检查是否是同一天的消息
  const isSameDay = previousMessage && previousMessage.createdAt && currentMessage.createdAt && 
    new Date(previousMessage.createdAt).toDateString() === 
    new Date(currentMessage.createdAt).toDateString();
  
  // 组合条件：相同用户且同一天的连续消息
  const isSameThread = isSameUser && isSameDay;

  // 头像间距，连续消息的头像间距更小
  const marginBottom = nextMessage && nextMessage.user && 
    nextMessage.user._id === currentMessage.user._id ? 2 : 10;
  
  // 自定义日期显示
  const renderDay = () => {
    if (currentMessage.createdAt) {
      // 只有不是同一天的消息才显示日期分隔线
      if (!isSameDay) {
        const date = new Date(currentMessage.createdAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateText = date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // 如果是今天或昨天，特殊处理
        if (date.toDateString() === today.toDateString()) {
          dateText = '今天';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateText = '昨天';
        }
        
        return (
          <View style={{ 
            alignItems: 'center', 
            margin: 10,
          }}>
            <Text style={{ 
              color: '#999', 
              fontSize: 12,
              backgroundColor: 'rgba(240, 240, 240, 0.7)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
            }}>
              {dateText}
            </Text>
          </View>
        );
      }
    }
    return null;
  };
  
  return (
    <View>
      {renderDay()}
      <View style={{ 
        flexDirection: 'row',
        marginBottom,
        paddingHorizontal: 8,
        alignItems: 'flex-end',
      }}>
        {/* 头像区域 */}
        <View style={{
          marginRight: 8,
          width: isSameThread ? 36 : 36,
          alignItems: 'center',
          opacity: isSameThread ? 0 : 1, // 连续消息不显示头像
        }}>
          {!isSameThread && currentMessage.user && currentMessage.user.avatar && (
            <Image 
              source={{ uri: currentMessage.user.avatar }}
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 4 
              }}
            />
          )}
        </View>
        
        {/* 消息内容区域 */}
        <View style={{ 
          flex: 1,
          marginTop: isSameThread ? 2 : 10,
        }}>
          {/* 用户名和时间 */}
          {!isSameThread && currentMessage.user && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 4
            }}>
              <Text style={{ 
                fontWeight: 'bold' as const, 
                fontSize: 14, 
                color: '#333' 
              }}>
                {currentMessage.user.name}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#999', 
                marginLeft: 8 
              }}>
                {new Date(currentMessage.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
          
          {/* 消息气泡 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 4,
            padding: 8,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            maxWidth: '95%',
          }}>
            {/* 文本消息 */}
            {currentMessage.text && (
              <Text style={{ fontSize: 15, color: '#333' }}>
                {currentMessage.text}
              </Text>
            )}
            
            {/* 图片消息 */}
            {currentMessage.image && (
              <Image 
                source={{ uri: currentMessage.image }}
                style={{ 
                  width: 200, 
                  height: 150, 
                  borderRadius: 4,
                  marginTop: currentMessage.text ? 8 : 0,
                }}
                resizeMode="cover"
              />
            )}
            
            {/* 音频消息 */}
            {currentMessage.audio && (
              <AudioMessage 
                currentMessage={currentMessage} 
                position="left" 
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// 自定义空消息状态组件
const renderChatEmpty = (loading: boolean) => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      transform: [{ scaleY: 1 }] // 确保文本不会被颠倒
    }}>
      <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
      <Text style={{ 
        fontSize: 16,
        color: '#666', 
        marginTop: 16,
        textAlign: 'center'
      }}>
        {loading ? '正在加入聊天广场...' : '聊天广场里还没有消息，\n快来发送第一条吧!'}
      </Text>
    </View>
  );
};

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const { sendMessage, lastMessage } = useWebSocketContext();
  const userInfo = useUserStore((state) => state.userInfo);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [dialogId, setDialogId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  // 音频播放状态
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  // 使用useAudioRecorder hook
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

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

  // 请求录音权限
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.error('没有麦克风权限');
      }
    })();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        // 只处理当前对话的消息
        if (data.type === 'GROUP_CHAT' && data.dialogId === dialogId) {
          let text = '';
          let image: string | undefined;
          let audio: string | undefined;
          let parsedContent = JSON.parse(data.textContent);
          try {
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
          } catch {
            text = data.textContent;
          }

          const newMessage: IMessage = {
            _id: Date.now().toString() + Math.random().toString(),
            text,
            createdAt: new Date(Number(data.timestamp)),
            user: {
              _id: parsedContent.nickname || '未知用户',
              name: parsedContent.nickname || '未知用户',
              avatar:
                parsedContent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown`,
            },
          };

          if (image) {
            newMessage.image = image;
          }

          if (audio) {
            newMessage.audio = audio;
          }

          setMessages((previousMessages) => GiftedChat.append(previousMessages, [newMessage]));
        }
      } catch (error) {
        console.log('解析消息失败:', error);
      }
    }
  }, [lastMessage, dialogId]);

  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      if (!dialogId) return;

      const message = messages[0];

      const textContent = JSON.stringify({
        type: 'text',
        text: message.text,
        avatar:
          userInfo?.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
        nickname: userInfo?.nickname || 'Me',
      });

      // 发送到WebSocket
      sendMessage(
        JSON.stringify({
          type: 'GROUP_CHAT',
          dialogId: dialogId,
          textContent: textContent,
        })
      );

      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    },
    [dialogId, sendMessage, userInfo]
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

          // 发送到WebSocket
          sendMessage(
            JSON.stringify({
              type: 'GROUP_CHAT',
              dialogId: dialogId,
              textContent: textContent,
            })
          );
        } else {
          console.error('图片上传失败:', response);
        }
      } catch (error) {
        console.error('图片上传或发送失败:', error);
      }
    }
  };

  // 语音录制功能
  const startRecording = async () => {
    try {
      // 先请求录音权限
      const permissionResponse = await AudioModule.requestRecordingPermissionsAsync();
      if (!permissionResponse.granted) {
        console.error('没有麦克风权限');
        return;
      }
      
      // 准备录音
      console.log('准备录音');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      
      // 设置录音状态监听
      const subscription = audioRecorder.addListener('recordingStatusUpdate', (status) => {
        console.log('录音状态更新:', status);
      });
      
      // 清理函数会在下一次调用或组件卸载时执行
      return () => {
        subscription.remove();
      };
    } catch (err) {
      console.error('开始录音失败:', err);
    }
  };

  const stopRecording = async () => {
    console.log('audioRecorder', audioRecorder);
    // if (!audioRecorder || !audioRecorder.isRecording) return;

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      console.log('录制的语音URI:', uri);

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
        }
      };
      
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [tempMessage]));
      
      // 上传录音文件
      const response = await fileApi.uploadImage({
        file: {
          uri,
          type: 'audio/mpeg',
          name: 'audio.mp3',
        },
        relatedId: randomId,
      });
      
      if (response.code === 200 && response.data) {
        const textContent = JSON.stringify({
          type: 'audio',
          url: response.data.url,
          avatar:
            userInfo?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.globalUserId || 'Me'}`,
          nickname: userInfo?.nickname || 'Me',
        });

        // 发送到WebSocket
        sendMessage(
          JSON.stringify({
            type: 'GROUP_CHAT',
            dialogId: dialogId,
            textContent: textContent,
          })
        );

        // 更新本地消息(替换临时消息)
        setMessages(prev => {
          const updatedMessages = prev.map(msg => 
            msg._id === randomId 
              ? {
                  ...msg,
                  text: '[语音消息]',
                  audio: response.data.url,
                }
              : msg
          );
          return updatedMessages;
        });

        // 收起工具栏
        setShowToolbar(false);
      } else {
        console.error('语音上传失败:', response);
        // 更新临时消息显示失败状态
        setMessages(prev => {
          const updatedMessages = prev.map(msg => 
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

  // 自定义渲染发送按钮
  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 4,
        }}>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </View>
      </Send>
    );
  };

  // 自定义气泡样式，参考Slack风格
  const renderBubble = (props: BubbleProps<IMessage>) => {
    const { currentMessage, position, nextMessage, previousMessage, user } = props;
    console.log('previousMessage', previousMessage);
    
    const isSameThread = previousMessage 
      && previousMessage.user 
      && currentMessage 
      && currentMessage.user 
      && previousMessage.user._id === currentMessage.user._id 
      && previousMessage.createdAt 
      && currentMessage.createdAt 
      && new Date(previousMessage.createdAt).toDateString() === new Date(currentMessage.createdAt).toDateString();

    // 消息样式
    const bubbleStyle = {
      left: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        padding: 8,
        marginBottom: 2,
        marginLeft: 8,
        marginRight: 0,
      },
      right: {
        backgroundColor: '#1483FD',
        borderRadius: 6,
        padding: 8,
        marginBottom: 2,
        marginLeft: 0,
        marginRight: 8,
      },
    };

    // 文本样式
    const textStyle = {
      left: {
        color: '#333333',
        fontSize: 15,
      },
      right: {
        color: '#FFFFFF',
        fontSize: 15,
      },
    };

    // 用户名样式
    const usernameStyle = {
      left: {
        color: '#555',
        fontWeight: 'bold' as const,
        fontSize: 14,
        marginBottom: 3,
      },
      right: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 'bold' as const,
        fontSize: 14,
        marginBottom: 3,
      }
    };

    // 渲染用户名
    const renderUsername = () => {
      if (isSameThread) return null;
      
      if (currentMessage?.user?.name) {
        return (
          <Text style={position === 'left' ? usernameStyle.left : usernameStyle.right}>
            {currentMessage.user.name}
          </Text>
        );
      }
      return null;
    };

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: bubbleStyle.left,
          right: bubbleStyle.right,
        }}
        textStyle={{
          left: textStyle.left,
          right: textStyle.right,
        }}
        renderUsername={currentMessage?.user?._id !== (props.user?._id || '') ? renderUsername : undefined}
        containerToPreviousStyle={{
          left: { marginTop: isSameThread ? 2 : 10 },
          right: { marginTop: isSameThread ? 2 : 10 },
        }}
      />
    );
  };

  // 自定义输入工具栏
  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: 'white',
          borderTopWidth: 0,
          borderRadius: 12,
          marginHorizontal: 10,
          marginBottom: 4,
          shadowColor: 'rgba(82, 100, 255, 0.10)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          paddingVertical: 4,
        }}
        primaryStyle={{ alignItems: 'center' }}
      />
    );
  };

  // 自定义文本输入区域
  const renderComposer = (props: ComposerProps) => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          backgroundColor: 'white',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 8,
          marginLeft: 0,
        }}
        placeholder="请输入消息..."
        placeholderTextColor="#999"
      />
    );
  };

  // 自定义输入工具栏操作区域
  const renderActions = (props: ActionsProps) => {
    return (
      <View className="ml-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            setShowToolbar(!showToolbar);
          }}
          className="mr-2">
          <Ionicons name="add-circle-outline" size={24} color="#1483FD" />
        </TouchableOpacity>
      </View>
    );
  };

  // 专门用于渲染音频消息的函数
  const renderMessageAudio = (props: MessageAudioProps<IMessage>) => {
    if (!props || !props.currentMessage) return null;
    
    const currentMessage = props.currentMessage as IAudioMessage;
    if (currentMessage && currentMessage.audio) {
      // 判断是否是当前用户发送的消息
      const isUserMessage = userInfo?.globalUserId === currentMessage.user?._id;

      return (
        <AudioMessage currentMessage={currentMessage} position={isUserMessage ? 'right' : 'left'} />
      );
    }
    return null;
  };

  return (
    <AudioContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}>
        <View className="flex-1 bg-[#f5f8fc]">
          {/* 头部 */}
          <View className="flex-row items-center px-4 py-3">
            <Pressable onPress={() => router.back()} className="absolute left-4 z-10">
              <Ionicons name="chevron-back" size={24} color="#666" />
            </Pressable>
            <Text className="flex-1 text-center text-lg font-medium">聊天广场</Text>
          </View>

          {/* 加载提示 */}
          {loading && (
            <Text className="px-4 py-2 text-center text-sm text-[#757575]">正在加入聊天广场...</Text>
          )}

          {/* GiftedChat 消息区域 */}
          <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
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
            renderActions={renderActions}
            renderMessageAudio={renderMessageAudio}
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
                <View className="mx-4 mb-2 flex-row justify-around rounded-lg bg-white p-4">
                  <TouchableOpacity onPress={pickImage} className="items-center">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Ionicons name="image" size={24} color="#1483FD" />
                    </View>
                    <Text className="mt-1 text-xs text-gray-600">图片</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={true}
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
                      {isRecording ? '松开结束' : '语音维护中'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            renderMessage={renderMessage}
            renderChatEmpty={() => renderChatEmpty(loading)}
          />
        </View>
      </KeyboardAvoidingView>
    </AudioContext.Provider>
  );
}
