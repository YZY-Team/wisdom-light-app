import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { 
    RTCPeerConnection, 
    RTCView, 
    mediaDevices, 
    RTCSessionDescription, 
    RTCIceCandidate 
  } from 'react-native-webrtc';
  import { Audio } from 'expo-av';

const LocalSignalingRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [status, setStatus] = useState('未连接');
  
  const peerConnection = useRef(null);
  const ws = useRef(null);
  
  // 初始化WebSocket
  useEffect(() => {
    // 使用电脑的本地IP地址，确保设备在同一网络
    ws.current = new WebSocket('ws://192.168.1.103:8080'); // 替换为你的电脑IP
    
    ws.current.onopen = () => setStatus('已连接到信令服务器');
    ws.current.onclose = () => setStatus('与信令服务器断开');
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'offer':
          handleOffer(message.offer);
          break;
        case 'answer':
          handleAnswer(message.answer);
          break;
        case 'candidate':
          handleCandidate(message.candidate);
          break;
      }
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);
  
  // 获取本地媒体流
  const getLocalStream = async () => {
    try {
      // 设置音频模式，确保音频通过扬声器播放
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,  // 这将确保音频通过扬声器播放
      });

      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });

      // 获取音频轨道并设置音量（0.0 ~ 1.0）
      const audioTrack = stream.getAudioTracks()[0];
      console.log('audioTrack', audioTrack);
      if (audioTrack && typeof audioTrack._setVolume === 'function') {
        audioTrack._setVolume(1); // 设置音量为最大
      } else {
        console.warn('setVolume not supported, using workaround');
        // 如果没有 _setVolume 方法，使用其他方式设置音量
      }

      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('获取媒体流失败:', err);
    }
  };
  
  // 初始化对等连接
  const initPeerConnection = (stream) => {
    peerConnection.current = new RTCPeerConnection();
    
    // 添加本地流
    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });
    
    // 监听远程流
    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    // 监听ICE候选
    peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          ws.current.send(JSON.stringify({
            type: 'candidate',
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
          }));
        }
      };
    return peerConnection.current;
  };
  
  // 发起呼叫
  const makeCall = async () => {
    setIsCaller(true);
    const stream = await getLocalStream();
    const pc = initPeerConnection(stream);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      ws.current.send(JSON.stringify({
        type: 'offer',
        offer: offer
      }));
      
      setStatus('已发送Offer');
    } catch (err) {
      console.error('创建Offer失败:', err);
    }
  };
  
  // 接听呼叫
  const answerCall = async () => {
    setIsCaller(false);
    const stream = await getLocalStream();
    initPeerConnection(stream);
    setStatus('等待呼叫...');
  };
  
  // 处理Offer
  const handleOffer = async (offer) => {
    if (!peerConnection.current) {
      const stream = await getLocalStream();
      initPeerConnection(stream);
    }
    
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      ws.current.send(JSON.stringify({
        type: 'answer',
        answer: answer
      }));
      
      setStatus('已应答Offer');
    } catch (err) {
      console.error('创建Answer失败:', err);
    }
  };
  
  // 处理Answer
  const handleAnswer = async (answer) => {
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus('连接建立中...');
    } catch (err) {
      console.error('设置远程描述失败:', err);
    }
  };
  
  // 处理ICE候选
  const handleCandidate = async (candidate) => {
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('添加ICE候选失败:', err);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.status}>状态: {status}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="发起通话" onPress={makeCall} />
        <Button title="等待接听" onPress={answerCall} />
      </View>
      
      <View style={styles.videoContainer}>
        <View style={styles.videoBox}>
          <Text style={styles.videoLabel}>本地视频</Text>
          {localStream && (
            <RTCView 
              streamURL={localStream.toURL()} 
              style={styles.video} 
              objectFit="cover"
            />
          )}
        </View>
        
        <View style={styles.videoBox}>
          <Text style={styles.videoLabel}>远程视频</Text>
          {remoteStream && (
            <RTCView 
              streamURL={remoteStream.toURL()} 
              style={styles.video} 
              objectFit="cover"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  videoContainer: {
    flex: 1,
  },
  videoBox: {
    marginBottom: 20,
  },
  videoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
});

export default LocalSignalingRTC;