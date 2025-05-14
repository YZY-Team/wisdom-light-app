import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { IAudioMessage } from './types';

interface AudioMessageProps {
  currentMessage?: IAudioMessage;
  position?: 'left' | 'right';
}

export const AudioMessage = ({ currentMessage, position }: AudioMessageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // 确定消息位置，根据提供的position
  const isUserMessage = position === 'right';

  // 加载音频
  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      if (!currentMessage?.audio) return;
      console.log('1312121', currentMessage);
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentMessage.audio },
          // { progressUpdateIntervalMillis: 100 },
          // onPlaybackStatusUpdate
        );

        if (isMounted) {
          setSound(newSound);
        } else {
          // 如果组件已卸载，释放音频资源
          await newSound.unloadAsync();
        }
      } catch (error) {
        console.error('加载音频失败:', error);
        if (isMounted) {
          setLoadError('加载失败，请重试');
        }
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      // 卸载音频
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentMessage?.audio]);

  // 播放状态更新回调
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      setCurrentTime(status.positionMillis / 1000);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
    }

    if (status.durationMillis && duration === null) {
      setDuration(status.durationMillis / 1000);
    }
  };

  const playSound = async () => {
    try {
      if (!currentMessage?.audio || !sound) return;

      // 如果已经在加载中，不要重复操作
      if (isLoading) return;

      // 如果有错误，重置错误状态
      if (loadError) setLoadError(null);

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 获取当前播放状态
      const status = await sound.getStatusAsync();

      // 播放或暂停
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        try {
          await sound.playAsync();
          setIsPlaying(true);
        } catch (error) {
          console.error('播放失败:', error);
          setLoadError('播放失败，请重试');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('播放音频失败:', error);
      setLoadError('播放失败，请重试');
      setIsLoading(false);
    }
  };

  // 组件卸载时释放资源
  useEffect(() => {
    return () => {
      if (sound && isPlaying) {
        sound.pauseAsync();
      }
    };
  }, [sound, isPlaying]);

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
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          size={24}
          color={isUserMessage ? '#fff' : '#1483FD'}
        />
      )}
      <View className={`ml-2 flex-1 ${isPlaying ? 'animate-pulse' : ''}`}>
        <View className="flex-row items-center">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`mx-0.5 rounded-full ${isUserMessage ? 'bg-white' : 'bg-[#1483FD]'}`}
              style={{
                width: 3 + i * 2,
                height: 4 + i * 2,
                opacity: isPlaying ? 0.5 + i * 0.1 : 0.3 + i * 0.1,
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
        {isPlaying
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

export default AudioMessage;
