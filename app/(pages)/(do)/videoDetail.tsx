import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

/**
 * 视频详情页面组件
 * 使用 expo-video 播放视频
 */
export default function VideoDetail() {
  const { videoUrl } = useLocalSearchParams();
  const router = useRouter();
  const player = useVideoPlayer(videoUrl as string, (player) => {
    player.loop = true; // 设置循环播放
    player.play(); // 自动播放
  });

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <AntDesign name="arrowleft" size={24} color="white" />


      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});