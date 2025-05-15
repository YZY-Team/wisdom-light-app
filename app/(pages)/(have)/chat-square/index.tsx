import { View, Text, Pressable, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect, useRef } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { dialogApi } from '~/api/have/dialog';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { fileApi } from '~/api/who/file';
import { useUserStore } from '~/store/userStore';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 导入拆分的组件
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
import createRenderMessageAudio from '~/components/chat/AudioMessageRenderer';
import ChatToolbar from '~/components/chat/ChatToolbar';

// 设置dayjs语言为中文
dayjs.locale('zh-cn');

interface AudioMessageProps {
  currentMessage: {
    audio?: string;
    _id: string | number;
  };
}

// function AudioMessage(props: AudioMessageProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [playbackPosition, setPlaybackPosition] = useState(0);
//   const [playbackDuration, setPlaybackDuration] = useState(0);
//   const [playbackFinished, setPlaybackFinished] = useState(false);

//   // 加载音频
//   useEffect(() => {
//     let soundObject: Audio.Sound | null = null;

//     const loadAudio = async () => {
//       if (props.currentMessage.audio) {
//         try {
//           const { sound: newSound } = await Audio.Sound.createAsync(
//             { uri: props.currentMessage.audio },
//             { shouldPlay: false }
//           );
          
//           setupPlaybackStatusListener(newSound);
//           setSound(newSound);
//           soundObject = newSound;
          
//           // 获取并记录音频时长
//           const status = await newSound.getStatusAsync();
//           if (status.isLoaded && status.durationMillis) {
//             setPlaybackDuration(status.durationMillis / 1000);
//           }
//         } catch (error) {
//           console.error('加载音频失败:', error);
//         }
//       }
//     };
    
//     loadAudio();
    
//     return () => {
//       if (soundObject) {
//         soundObject.unloadAsync()
//           .catch(err => console.error('音频资源释放失败:', err));
//       }
//     };
//   }, [props.currentMessage.audio]);
  
//   const setupPlaybackStatusListener = (soundObj: Audio.Sound) => {
//     soundObj.setOnPlaybackStatusUpdate(status => {
//       if (status.isLoaded && status.durationMillis) {
//         setPlaybackPosition(status.positionMillis / 1000);
        
//         if (status.isPlaying) {
//           setIsPlaying(true);
//         } else {
//           setIsPlaying(false);
          
//           if (status.didJustFinish) {
//             setPlaybackPosition(0);
//             setPlaybackFinished(true);
//           }
//         }
//       }
//     });
//   };
  
//   const handlePlayPause = async () => {
//     if (!sound) return;
    
//     try {
//       if (isPlaying) {
//         await sound.pauseAsync();
//         setIsPlaying(false);
//         return;
//       }
      
//       const status = await sound.getStatusAsync();
      
//       if (playbackFinished || 
//           (status.isLoaded && 
//            status.durationMillis && 
//            status.positionMillis && 
//            status.positionMillis >= status.durationMillis - 500)) {
//         await sound.setPositionAsync(0);
//         setPlaybackPosition(0);
//         setPlaybackFinished(false);
//       }
      
//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: true,
//         allowsRecordingIOS: false,
//         shouldDuckAndroid: true,
//         playThroughEarpieceAndroid: false,
//       });
      
//       await sound.playAsync();
//       setIsPlaying(true);
//     } catch (error) {
//       console.error('播放/暂停操作失败:', error);
      
//       if (props.currentMessage.audio) {
//         try {
//           if (sound) {
//             await sound.unloadAsync();
//           }
          
//           const { sound: newSound } = await Audio.Sound.createAsync(
//             { uri: props.currentMessage.audio },
//             { shouldPlay: true }
//           );
          
//           setupPlaybackStatusListener(newSound);
//           setSound(newSound);
//           setIsPlaying(true);
//           setPlaybackFinished(false);
//         } catch (reloadError) {
//           console.error('重新加载音频失败:', reloadError);
//         }
//       }
//     }
//   };
  
//   if (!props.currentMessage.audio) {
//     return null;
//   }
  
//   // 格式化时间函数
//   const formatTime = (seconds: number) => {
//     if (!seconds) return '00:00';
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
//   };
  
//   return (
//     <View style={{
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 8,
//       backgroundColor: '#e0e0e0',
//       borderRadius: 10,
//       minHeight: 50, // 固定最小高度
//       width: '100%', // 固定宽度
//     }}>
//       <TouchableOpacity 
//         onPress={handlePlayPause} 
//         style={{
//           width: 40,  // 固定宽度
//           height: 40, // 固定高度
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginRight: 8
//         }}
//       >
//         <Ionicons 
//           name={isPlaying ? 'pause-circle' : 'play-circle'} 
//           size={30} 
//           color="#007AFF" 
//         />
//       </TouchableOpacity>
      
//       <View style={{ flex: 1 }}>
//         {/* 使用固定高度的容器来避免文本切换时的抖动 */}
//         <View style={{ height: 20, justifyContent: 'center' }}>
//           <Text style={{ fontSize: 14 }}>
//             {isPlaying ? '正在播放...' : '点击播放语音'}
//           </Text>
//         </View>
        
//         {/* 总是显示时间信息，即使是0:00/0:00，避免布局变化 */}
//         <View style={{ height: 16, justifyContent: 'center', marginTop: 4 }}>
//           <Text style={{ fontSize: 12, color: '#666' }}>
//             {formatTime(playbackPosition)} / {formatTime(playbackDuration || 0)}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const { sendMessage, lastMessage } = useWebSocketContext();
  const userInfo = useUserStore((state) => state.userInfo);
  const [messages, setMessages] = useState<IMessage[]>([
    // {
    //   _id: '1',
    //   text: '你好',
    //   createdAt: new Date(),
    //   user: {
    //     _id: '1',
    //     name: '张三',
    //     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
    //   },
    //   audio: 'http://119.29.188.102:9000/image/a7785d7db2fe426f8932e4e2f70daa13.mp3',
    // },
  ]);
  const [dialogId, setDialogId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  // 音频播放状态
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // 使用expo-av的Recording对象
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

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
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
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
            (newMessage as IAudioMessage).audio = audio;
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
      // 请求录音权限
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        console.error('没有麦克风权限');
        return;
      }

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 准备录音
      console.log('准备录音');
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
    try {
      if (!recording) {
        console.log('没有录音对象');
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('录制的语音URI:', uri);

      setIsRecording(false);
      setRecording(null);

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

  try {
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
              <Text className="px-4 py-2 text-center text-sm text-[#757575]">
                正在加入聊天广场...
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
              renderChatEmpty={() => renderChatEmpty({ loading, isGroupChat: false })}
            />
          </View>
        </KeyboardAvoidingView>
      </AudioContext.Provider>
    );
  } catch (error) {
    console.error('ChatSquare 渲染失败:', error);
    return (
      <View>
        <Text>ChatSquare 渲染失败</Text>
      </View>
    );
  }
}
