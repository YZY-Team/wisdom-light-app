import { View, Text, TouchableOpacity, Alert, Dimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, memo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import Animated from 'react-native-reanimated';

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
};

const MessageItem = memo(({ content, time, user, isSelf, imageUrl, audioUrl }: MessageProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // 添加调试信息
  useEffect(() => {
    if (audioUrl) {
      console.log('音频消息渲染:', { isSelf, audioUrl });
    }
  }, [audioUrl, isSelf]);

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
        const { sound: newSound } = await Audio.Sound.createAsync(
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
              } else if (status.didJustFinish) {
                setIsPlaying(false);
              }
            }
          }
        );
        
        setSound(newSound);
        setIsPlaying(true);
        
        // 获取音频时长
        const status = await newSound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          console.log('立即获取音频时长', status.durationMillis);
          setAudioDuration(status.durationMillis);
        }
      }
    } catch (error) {
      console.error('播放语音消息失败:', error);
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
    <View className={`mb-4 flex-row ${isSelf ? 'flex-row-reverse' : ''}`}>
      <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" contentFit="cover" />
      <View className={`flex-1 ${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
        {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
        <View
          className={`relative rounded-2xl p-3 ${isSelf ? 'bg-blue-500' : 'bg-white'}`}
          style={[
            { maxWidth: '70%' },
            audioUrl ? getAudioStyle() : {}
          ]}>
          {/* 添加调试信息，不要在JSX中直接使用console.log */}
          {imageUrl ? (
            <TouchableOpacity onPress={() => setShowImagePreview(true)}>
              <Image
                source={{ uri: imageUrl }}
                className="h-40 w-40 rounded-md"
                contentFit="cover"
              />
            </TouchableOpacity>
          ) : audioUrl ? (
            <TouchableOpacity 
              onPress={() => {
                console.log('点击音频消息', { isSelf, audioUrl });
                playSound();
              }} 
              className="flex-row items-center w-full"
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={24}
                color={isSelf ? '#fff' : '#333'}
              />
              <View className="ml-2 flex-1">
                <Text className={`${isSelf ? 'text-white' : 'text-gray-800'}`}>
                  {isPlaying ? '正在播放语音...' : '点击播放语音'}
                </Text>
                <Text className={`text-xs ${isSelf ? 'text-white/70' : 'text-gray-500'}`}>
                  {formatDuration(audioDuration)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
          )}
        </View>
        <Text className="mt-1 text-xs text-gray-400">{time}</Text>
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
