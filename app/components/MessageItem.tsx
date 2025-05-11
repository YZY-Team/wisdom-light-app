import { View, Text, TouchableOpacity, Alert, Dimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, memo, createContext, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import Animated from 'react-native-reanimated';

// 创建全局音频上下文来管理当前播放的消息
const AudioContext = createContext<{
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
});

// 音频上下文提供者组件
export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  return (
    <AudioContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      {children}
    </AudioContext.Provider>
  );
};

// 图片预览组件
const ImagePreview = memo(
  ({
    visible,
    imageUrl,
    onClose,
  }: {
    visible: boolean;
    imageUrl?: string;
    onClose: () => void;
  }) => {
    // 长按保存图片
    const handleLongPress = async () => {
      if (!imageUrl) return;

      try {
        // 使用 MediaLibrary 保存图片
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status === 'granted') {
          Alert.alert('保存图片', '确定要保存此图片到相册吗？', [
            { text: '取消', style: 'cancel' },
            {
              text: '确定',
              onPress: async () => {
                try {
                  const { uri } = await FileSystem.downloadAsync(
                    imageUrl,
                    FileSystem.documentDirectory + (imageUrl.split('/').pop() || 'image.jpg')
                  );

                  const asset = await MediaLibrary.createAssetAsync(uri);
                  await MediaLibrary.createAlbumAsync('WisdomLight', asset, false);

                  Alert.alert('成功', '图片已保存到相册');
                } catch (error) {
                  console.error('保存图片失败:', error);
                  Alert.alert('错误', '保存图片失败');
                }
              },
            },
          ]);
        } else {
          Alert.alert('权限不足', '需要访问相册权限才能保存图片');
        }
      } catch (error) {
        console.error('保存图片错误:', error);
      }
    };

    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 bg-black">
          <TouchableOpacity className="absolute right-5 top-10 z-10" onPress={onClose}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            {imageUrl && (
              <TouchableOpacity onLongPress={handleLongPress} delayLongPress={500}>
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height * 0.8,
                  }}
                  contentFit="contain"
                  contentPosition="center"
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="absolute bottom-10 w-full items-center">
            <Text className="text-sm text-white">长按可保存</Text>
          </View>
        </View>
      </Modal>
    );
  }
);

export type MessageProps = {
  content: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  isSelf?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  messageId?: string;
  readStatus?: string;
};

const MessageItem = memo(({ content, time, user, isSelf, imageUrl, audioUrl, messageId, readStatus }: MessageProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // 使用全局音频上下文
  const { currentPlayingId, setCurrentPlayingId } = useContext(AudioContext);
  
  // 检查当前消息是否正在播放
  const isThisPlaying = messageId && currentPlayingId === messageId;
  
  // 当全局播放ID变化时更新本地播放状态
  useEffect(() => {
    // 如果当前全局播放的不是这条消息，但本地状态显示正在播放，则停止播放
    if (messageId && currentPlayingId !== messageId && isPlaying) {
      if (sound) {
        console.log('全局播放ID变化，停止当前音频', messageId);
        sound.stopAsync();
        setIsPlaying(false);
      }
    }
  }, [currentPlayingId, messageId, sound, isPlaying]);

  // 添加调试信息
  useEffect(() => {
    if (audioUrl) {
      console.log('音频消息渲染:', { isSelf, audioUrl, messageId });
    }
  }, [audioUrl, isSelf, messageId]);

  const playSound = async () => {
    if (!audioUrl || !messageId) return;

    try {
      // 如果已经在加载中，不要重复操作
      if (isLoading) return;

      // 如果有错误，重置错误状态
      if (loadError) setLoadError(null);

      // 如果当前有其他消息在播放，通知上下文切换播放ID
      if (currentPlayingId && currentPlayingId !== messageId) {
        console.log('切换播放ID', { from: currentPlayingId, to: messageId });
        setCurrentPlayingId(messageId);
      }

      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
          setIsPlaying(false);
          setCurrentPlayingId(null);
        } else {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.playAsync();
              setIsPlaying(true);
              setCurrentPlayingId(messageId);
            } else {
              // 如果声音没有正确加载，重新加载
              console.log('声音未正确加载，重新尝试');
              setSound(null);
              loadAndPlaySound();
            }
          } catch (error) {
            console.error('播放已存在的声音失败:', error);
            setLoadError('播放失败，请重试');
            setIsPlaying(false);
            setCurrentPlayingId(null);
          }
        }
      } else {
        loadAndPlaySound();
      }
    } catch (error) {
      console.error('播放语音消息失败:', error);
      setLoadError('播放失败，请重试');
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentPlayingId(null);
    }
  };

  // 抽取加载和播放音频的逻辑到单独的函数
  const loadAndPlaySound = async () => {
    if (!audioUrl || !messageId) return; // 确保messageId存在
    
    try {
      setIsLoading(true);
      
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('加载超时')), 10000); // 10秒超时
      });
      
      // 创建加载音频的Promise
      const loadPromise = Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            // 如果还没有获取到时长，且现在有了时长信息
            if (audioDuration === null && status.durationMillis) {
              console.log('音频时长', status.durationMillis);
              setAudioDuration(status.durationMillis);
            }
            
            // 更新播放状态
            if (status.isPlaying) {
              setIsPlaying(true);
              if (messageId) setCurrentPlayingId(messageId); // 确保messageId存在
              setIsLoading(false);
            } else if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentPlayingId(null);
              setIsLoading(false);
            }
          }
        }
      );
      
      // 使用Promise.race来处理超时
      const result = await Promise.race([loadPromise, timeoutPromise]) as {sound: Audio.Sound};
      const newSound = result.sound;
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(messageId);
      
      // 获取音频时长
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        console.log('立即获取音频时长', status.durationMillis);
        setAudioDuration(status.durationMillis);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('加载音频失败:', error);
      setLoadError('加载失败，请重试');
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentPlayingId(null);
    }
  };

  // 格式化时长为分:秒格式
  const formatDuration = (milliseconds: number | null): string => {
    if (milliseconds === null) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 如果是音频消息，组件加载时尝试预加载以获取时长
  useEffect(() => {
    const loadAudioDuration = async () => {
      if (audioUrl && !audioDuration) {
        try {
          console.log('尝试预加载音频获取时长', audioUrl);
          const { sound: tempSound } = await Audio.Sound.createAsync({ uri: audioUrl }, {}, null);
          const status = await tempSound.getStatusAsync();
          
          if (status.isLoaded && status.durationMillis) {
            console.log('预加载获取音频时长', status.durationMillis);
            setAudioDuration(status.durationMillis);
          }
          
          // 卸载临时音频
          await tempSound.unloadAsync();
        } catch (error) {
          console.error('获取音频时长失败:', error);
        }
      }
    };
    
    loadAudioDuration();
  }, [audioUrl, audioDuration]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // 如果渲染的是音频消息，添加样式
  const getAudioStyle = () => {
    return { 
      minWidth: 120, // 确保音频消息有最小宽度
    };
  };

  return (
    <View className={`mb-4 px-4 flex-row ${isSelf ? 'flex-row-reverse' : ''}`}>
      <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" contentFit="cover" />
      <View className={`flex-1  ${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
        {!isSelf && <Text className="mb-1 text-sm  text-gray-600">{user.name}</Text>}
        <View
          className={`relative rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}
          style={[
            { maxWidth: '70%' },
            audioUrl ? getAudioStyle() : {}
          ]}>
          {imageUrl ? (
            <TouchableOpacity onPress={() => setShowImagePreview(true)}>
              <Image
                source={{ uri: imageUrl }}
                className="h-40 w-40 rounded-md"
                contentFit="cover"
              />
            </TouchableOpacity>
          ) : audioUrl ? (
            <TouchableOpacity onPress={playSound} disabled={isLoading}>
              <View className="flex-row items-center">
                <View className="mr-2">
                  {isLoading ? (
                    <Ionicons name="ellipsis-horizontal" size={24} color={isSelf ? '#fff' : '#666'} />
                  ) : isThisPlaying ? (
                    <Ionicons name="pause" size={24} color={isSelf ? '#fff' : '#666'} />
                  ) : (
                    <Ionicons name="play" size={24} color={isSelf ? '#fff' : '#666'} />
                  )}
                </View>
                <View className="flex-1">
                  <View
                    className={`h-1 rounded-full ${isSelf ? 'bg-blue-300' : 'bg-gray-300'}`}
                    style={{ width: audioDuration ? '100%' : 80 }}
                  />
                  {loadError && (
                    <Text className={`mt-1 text-xs ${isSelf ? 'text-red-200' : 'text-red-500'}`}>
                      {loadError}
                    </Text>
                  )}
                </View>
                <Text
                  className={`ml-2 text-xs ${isSelf ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatDuration(audioDuration) || '0:00'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text
              className={`text-sm ${isSelf ? 'text-white' : 'text-gray-900'}`}
              selectable={true}>
              {content}
            </Text>
          )}
        </View>
        <View className="mt-1 flex-row items-center ">
          <Text className={` text-xs`}>{time}</Text>
          {isSelf && readStatus && (
            <Text className="ml-2 text-xs text-gray-500">{readStatus}</Text>
          )}
        </View>
      </View>

      {/* 图片预览模态框 */}
      <ImagePreview
        visible={showImagePreview}
        imageUrl={imageUrl}
        onClose={() => setShowImagePreview(false)}
      />
    </View>
  );
});

export default MessageItem;
