import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Sound from 'react-native-sound';
import { IAudioMessage } from './types';
import { Audio } from 'expo-av';

// 确保Sound可以在静音模式下播放
Sound.setCategory('Playback');

interface AudioMessageProps {
  currentMessage?: IAudioMessage;
  position?: 'left' | 'right';
}

function AudioMessage(props: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackFinished, setPlaybackFinished] = useState(false);

  // 加载音频
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    const loadAudio = async () => {
      if (props.currentMessage.audio) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: props.currentMessage.audio },
            { shouldPlay: false }
          );

          setupPlaybackStatusListener(newSound);
          setSound(newSound);
          soundObject = newSound;

          // 获取并记录音频时长
          const status = await newSound.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            setPlaybackDuration(status.durationMillis / 1000);
          }
        } catch (error) {
          console.error('加载音频失败:', error);
        }
      }
    };

    loadAudio();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync().catch((err) => console.error('音频资源释放失败:', err));
      }
    };
  }, [props.currentMessage.audio]);

  const setupPlaybackStatusListener = (soundObj: Audio.Sound) => {
    soundObj.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.durationMillis) {
        setPlaybackPosition(status.positionMillis / 1000);

        if (status.isPlaying) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);

          if (status.didJustFinish) {
            setPlaybackPosition(0);
            setPlaybackFinished(true);
          }
        }
      }
    });
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      const status = await sound.getStatusAsync();

      if (
        playbackFinished ||
        (status.isLoaded &&
          status.durationMillis &&
          status.positionMillis &&
          status.positionMillis >= status.durationMillis - 500)
      ) {
        await sound.setPositionAsync(0);
        setPlaybackPosition(0);
        setPlaybackFinished(false);
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('播放/暂停操作失败:', error);

      if (props.currentMessage.audio) {
        try {
          if (sound) {
            await sound.unloadAsync();
          }

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: props.currentMessage.audio },
            { shouldPlay: true }
          );

          setupPlaybackStatusListener(newSound);
          setSound(newSound);
          setIsPlaying(true);
          setPlaybackFinished(false);
        } catch (reloadError) {
          console.error('重新加载音频失败:', reloadError);
        }
      }
    }
  };

  if (!props.currentMessage.audio) {
    return null;
  }

  // 格式化时间函数
  const formatTime = (seconds: number) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        minHeight: 50, // 固定最小高度
        width: '100%', // 固定宽度
      }}>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={{
          width: 40, // 固定宽度
          height: 40, // 固定高度
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 8,
        }}>
        <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={30} color="#007AFF" />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        {/* 使用固定高度的容器来避免文本切换时的抖动 */}
        <View style={{ height: 20, justifyContent: 'center' }}>
          <Text style={{ fontSize: 14 }}>{isPlaying ? '正在播放...' : '点击播放语音'}</Text>
        </View>

        {/* 总是显示时间信息，即使是0:00/0:00，避免布局变化 */}
        <View style={{ height: 16, justifyContent: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {formatTime(playbackPosition)} / {formatTime(playbackDuration || 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default AudioMessage;
