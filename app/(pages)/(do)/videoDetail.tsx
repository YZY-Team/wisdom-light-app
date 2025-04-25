
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams } from 'expo-router';

/**
 * 视频详情页面组件
 * 使用 expo-video 播放视频
 */
export default function VideoDetail() {
  const { videoUrl } = useLocalSearchParams();
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true; // 设置循环播放
    player.play(); // 自动播放
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 300,
  },
});