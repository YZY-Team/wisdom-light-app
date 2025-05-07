import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RTCView, MediaStream, RTCPeerConnection, mediaDevices, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import {AntDesign} from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { acceptCall } from '~/api/have/dialog';
import { useWebSocketContext } from '~/contexts/WebSocketContext';

interface Friend {
  id: string;
  headImage: string;
  showNickName: string;
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export default function PrivateRTC() {
  // 从路由参数获取通话信息
  const params = useLocalSearchParams();
  const mode = params.mode as 'video' | 'voice';
  const isHost = params.isHost === 'true';
  const callerId = params.callerId as string;
  const callId = params.callId as string;

  const { sendMessage, lastMessage } = useWebSocketContext();

  // 状态管理
  const [state, setState] = useState('INIT'); // INIT, WAITING, CHATING, CLOSE, ERROR
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicroPhone, setIsMicroPhone] = useState(true);
  const [isFacing, setIsFacing] = useState(true);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [tip, setTip] = useState('');
  const [chatTime, setChatTime] = useState(0);

  // Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const callAudioRef = useRef<Audio.Sound | null>(null);
  const handupAudioRef = useRef<Audio.Sound | null>(null);
  const chatTimerRef = useRef<NodeJS.Timer | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timer | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timer | null>(null);

  // 计算属性
  const isConnected = state === 'CHATING';
  const isVideoMode = mode === 'video';
  const isVoiceMode = mode === 'voice';

  const chatTimeString = () => {
    const min = Math.floor(chatTime / 60);
    const sec = chatTime % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // 方法
  const onSwitchMicroPhone = () => {
    setIsMicroPhone(!isMicroPhone);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicroPhone;
      });
    }
  };

  const onSwitchCamera = async () => {
    setIsFacing(!isFacing);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack._switchCamera();
      }
    }
  };

  const onSwitchSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    // TODO: 实现扬声器切换逻辑
  };

  const onHandup = () => {
    // TODO: 实现挂断逻辑
    router.back();
  };

  // 初始化本地流
  const initLocalStream = async () => {
    try {
      const constraints = {
        audio: true,
        video: mode === 'video' ? {
          facingMode: isFacing ? 'user' : 'environment',
        } : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('获取本地媒体流失败:', err);
      setState('ERROR');
      setTip('无法访问摄像头或麦克风');
      return null;
    }
  };

  // 初始化RTCPeerConnection
  const initPeerConnection = async (stream: MediaStream) => {
    const pc = new RTCPeerConnection(configuration);
    
    // 添加本地流
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // 处理远程流
    pc.addEventListener('track', (event: RTCTrackEvent) => {
      setRemoteStream(event.streams[0]);
    });

    // ICE候选处理
    pc.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        // 发送ICE候选到对方
        sendMessage(JSON.stringify({
          type: 'ICE_CANDIDATE',
          callId,
          candidate: event.candidate,
        }));
      }
    });

    // 连接状态变化
    pc.addEventListener('connectionstatechange', () => {
      switch(pc.connectionState) {
        case 'connected':
          setState('CHATING');
          break;
        case 'disconnected':
        case 'failed':
          setState('ERROR');
          setTip('连接已断开');
          break;
      }
    });

    peerConnection.current = pc;
    return pc;
  };

  // 处理WebSocket消息
  useEffect(() => {
    if (!lastMessage?.data) return;

    try {
      const data = JSON.parse(lastMessage.data);
      
      switch(data.type) {
        case 'OFFER':
          handleOffer(data);
          break;
        case 'ANSWER':
          handleAnswer(data);
          break;
        case 'ICE_CANDIDATE':
          handleIceCandidate(data);
          break;
      }
    } catch (err) {
      console.error('处理WebSocket消息失败:', err);
    }
  }, [lastMessage]);

  // 处理Offer
  const handleOffer = async (data: any) => {
    if (!peerConnection.current) return;
    
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      sendMessage(JSON.stringify({
        type: 'ANSWER',
        callId,
        answer,
      }));
    } catch (err) {
      console.error('处理Offer失败:', err);
      setState('ERROR');
      setTip('连接失败');
    }
  };

  // 处理Answer
  const handleAnswer = async (data: any) => {
    if (!peerConnection.current) return;
    
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (err) {
      console.error('处理Answer失败:', err);
      setState('ERROR');
      setTip('连接失败');
    }
  };

  // 处理ICE候选
  const handleIceCandidate = async (data: any) => {
    if (!peerConnection.current) return;
    
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error('处理ICE候选失败:', err);
    }
  };

  // 接受通话
  const onAcceptCall = async () => {
    try {
      await acceptCall(callId);
      setState('WAITING');
      
      // 初始化本地流和RTCPeerConnection
      const stream = await initLocalStream();
      if (!stream) return;
      
      await initPeerConnection(stream);
      
      // 如果是被叫方,等待Offer
      if (!isHost) {
        setTip('等待对方连接...');
      }
      // 如果是主叫方,创建并发送Offer
      else {
        if (!peerConnection.current) return;
        
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        sendMessage(JSON.stringify({
          type: 'OFFER',
          callId,
          offer,
        }));
        
        setTip('正在连接...');
      }
    } catch (error) {
      console.error('接听电话失败:', error);
      setState('ERROR');
      setTip('接听失败');
    }
  };

  // 样式
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'gray',
    },
    mask: {
      ...StyleSheet.absoluteFillObject,
    },
    friendAvatar: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 200,
    },
    friendName: {
      fontSize: 40,
      color: 'black',
    },
    videoBox: {
      flex: 1,
      position: 'relative',
    },
    localVideo: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 200,
      height: 200,
      backgroundColor: 'grey',
      zIndex: 999,
    },
    remoteVideo: {
      flex: 1,
      backgroundColor: 'darkgray',
    },
    tip: {
      position: 'absolute',
      bottom: 350,
      width: '100%',
      textAlign: 'center',
      fontSize: 35,
      padding: 20,
      color: 'white',
    },
    chatTime: {
      position: 'absolute',
      bottom: 250,
      width: '100%',
      textAlign: 'center',
      fontSize: 40,
      color: 'white',
    },
    controlBar: {
      position: 'absolute',
      bottom: 80,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    iconRtc: {
      backgroundColor: '#1ba609',
      borderRadius: 50,
      padding: 20,
    },
    iconRtcRed: {
      backgroundColor: '#e61d1d',
    },
    iconTool: {
      backgroundColor: '#4f4f4f',
      borderRadius: 50,
      padding: 20,
    },
  });

  return (
    <View style={styles.container}>
      <BlurView intensity={50} style={styles.mask}>
        {/* TODO: Add background image */}
      </BlurView>

      {(!isConnected || isVoiceMode) && (
        <View style={styles.friendAvatar}>
          {/* TODO: Add friend avatar component */}
          <Text style={styles.friendName}>{callerId}</Text>
          {!isHost && !isConnected && (
            <Text style={styles.tip}>来电邀请...</Text>
          )}
        </View>
      )}

      {isConnected && isVideoMode && (
        <View style={styles.videoBox}>
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.remoteVideo}
              objectFit="cover"
            />
          )}
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              zOrder={1}
            />
          )}
        </View>
      )}

      <Text style={styles.tip}>{tip}</Text>
      {isConnected && <Text style={styles.chatTime}>{chatTimeString()}</Text>}

      <View style={styles.controlBar}>
        {isConnected && (
          <TouchableOpacity onPress={onSwitchMicroPhone} style={styles.iconTool}>
            <AntDesign
              name={isMicroPhone ? 'customerservice' : 'disconnect'}
              size={30}
              color="white"
            />
          </TouchableOpacity>
        )}

        {!isHost && !isConnected ? (
          <>
            <TouchableOpacity onPress={onAcceptCall} style={styles.iconRtc}>
              <AntDesign name="phone" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onHandup} style={[styles.iconRtc, styles.iconRtcRed]}>
              <AntDesign name="phone" size={30} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onHandup} style={[styles.iconRtc, styles.iconRtcRed]}>
            <AntDesign name="closecircle" size={30} color="white" />
          </TouchableOpacity>
        )}

        {isConnected && isVideoMode && (
          <TouchableOpacity onPress={onSwitchCamera} style={styles.iconTool}>
            <AntDesign
              name="camera"
              size={30}
              color="white"
            />
          </TouchableOpacity>
        )}

        {isConnected && isVoiceMode && (
          <TouchableOpacity onPress={onSwitchSpeaker} style={styles.iconTool}>
            <AntDesign
              name={isSpeaker ? 'customerservice' : 'disconnect'}
              size={30}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
