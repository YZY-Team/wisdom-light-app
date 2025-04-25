import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
// 定义WebSocket和RTCPeerConnection类型，修复TypeScript错误
type WebSocketRef = WebSocket | null;
type RTCPeerConnectionRef = RTCPeerConnection | null;
type MediaStreamType = any; // 使用any临时解决类型问题

const LocalSignalingRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStreamType>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStreamType>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [status, setStatus] = useState('未连接');
  const [callTime, setCallTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerConnection = useRef<RTCPeerConnectionRef>(null);
  const ws = useRef<WebSocketRef>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 处理挂断信号
  const handleHangup = () => {
    endCall(); // 调用结束通话的函数
    setStatus('对方已挂断');
  };
  // 初始化WebSocket
  useEffect(() => {
    // 使用电脑的本地IP地址，确保设备在同一网络
    ws.current = new WebSocket('ws://192.168.1.103:8080'); // 替换为你的电脑IP

    if (ws.current) {
      ws.current.onopen = () => setStatus('已连接到信令服务器');
      ws.current.onclose = () => setStatus('与信令服务器断开');

      ws.current.onmessage = (event: MessageEvent) => {
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
          case 'hangup':
            // 处理挂断消息
            handleHangup();
            break;
        }
      };
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
        playThroughEarpieceAndroid: false, // 这将确保音频通过扬声器播放
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
      return null;
    }
  };

  // 初始化对等连接
  const initPeerConnection = (stream: MediaStreamType) => {
    if (!stream) {
      console.error('没有可用的媒体流');
      return null;
    }

    console.log('初始化peer connection');
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // 可以添加更多STUN/TURN服务器
      ],
    });

    // 添加本地流
    stream.getTracks().forEach((track: any) => {
      if (peerConnection.current) {
        peerConnection.current.addTrack(track, stream);
      }
    });

    // 监听远程流
    if (peerConnection.current) {
      peerConnection.current.ontrack = (event: any) => {
        console.log('收到远程流');
        console.log('event', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      // 监听ICE候选
      peerConnection.current.onicecandidate = (event: any) => {
        if (event.candidate && ws.current) {
          console.log('发送ICE候选');
          ws.current.send(
            JSON.stringify({
              type: 'candidate',
              candidate: {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
              },
            })
          );
        }
      };
    }

    return peerConnection.current;
  };

  // 发起呼叫
  const makeCall = async () => {
    setIsCaller(true);
    setStatus('正在呼叫...');
    const stream = await getLocalStream();
    const pc = initPeerConnection(stream);

    // 开始计时器
    startCallTimer();
    setIsCallActive(true);

    try {
      if (pc) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (ws.current) {
          ws.current.send(
            JSON.stringify({
              type: 'offer',
              offer: offer,
            })
          );
        }
      }
    } catch (err) {
      console.error('创建Offer失败:', err);
    }
  };

  // 接听呼叫
  const answerCall = async () => {
    setIsCaller(false);
    setStatus('等待呼叫...');
    const stream = await getLocalStream();
    initPeerConnection(stream);
  };

  // 处理Offer
  const handleOffer = async (offer: any) => {
    try {
      console.log('收到offer:', offer);

      // 确保有本地流和peerConnection
      if (!peerConnection.current) {
        const stream = await getLocalStream();
        if (!stream) {
          throw new Error('无法获取本地媒体流');
        }
        initPeerConnection(stream);
      }

      if (!peerConnection.current) {
        throw new Error('PeerConnection 初始化失败');
      }

      // 设置远程描述
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('远程描述设置成功');

      // 创建answer
      const answer = await peerConnection.current.createAnswer();
      console.log('创建answer成功:', answer);

      // 设置本地描述
      await peerConnection.current.setLocalDescription(answer);
      console.log('本地描述设置成功');

      // 发送answer
      if (ws.current) {
        ws.current.send(
          JSON.stringify({
            type: 'answer',
            answer: answer,
          })
        );
        console.log('answer发送成功');
      }

      setStatus('已接通');
      startCallTimer();
      setIsCallActive(true);
    } catch (err) {
      console.error('处理offer失败:', err);
      setStatus('连接失败');
    }
  };

  // 处理Answer
  const handleAnswer = async (answer: any) => {
    try {
      console.log('收到answer:', answer);

      if (!peerConnection.current) {
        throw new Error('PeerConnection 未初始化');
      }

      // 验证answer格式
      if (!answer || !answer.type || !answer.sdp) {
        throw new Error('无效的answer格式');
      }

      // 打印SDP内容用于调试
      console.log('SDP内容:', answer.sdp);

      // 设置远程描述
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('远程描述设置成功');

      setStatus('已接通');
    } catch (err) {
      console.error('设置远程描述失败:', err);

      // 更详细的错误处理
      if (err instanceof Error) {
        console.error('错误详情:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      }

      setStatus('连接失败: ' + (err instanceof Error ? err.message : '未知错误'));

      // 尝试重新协商
      if (peerConnection.current) {
        try {
          console.log('尝试重新协商...');
          const newOffer = await peerConnection.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peerConnection.current.setLocalDescription(newOffer);

          if (ws.current) {
            ws.current.send(
              JSON.stringify({
                type: 'offer',
                offer: newOffer,
              })
            );
          }
        } catch (renegError) {
          console.error('重新协商失败:', renegError);
        }
      }
    }
  };

  // 处理ICE候选
  const handleCandidate = async (candidate: any) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('添加ICE候选失败:', err);
    }
  };

  // 开始通话计时器
  const startCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setCallTime(0);
    timerRef.current = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
  };

  // 格式化通话时间
  const formatCallTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 结束通话
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 向服务器发送挂断信号
    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          type: 'hangup',
          sender: 'user1', // 可以使用用户标识来区分是谁挂断的
        })
      );
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setStatus('通话已结束');
  };
  // 切换麦克风
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        track.enabled = !track.enabled;
        setIsMuted(!isMuted);
        console.log(`麦克风已${track.enabled ? '开启' : '关闭'}`);
      } else {
        console.warn('未找到音频轨道');
      }
    } else {
      console.warn('本地流未初始化');
    }
  };
  // 切换视频
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        track.enabled = !track.enabled;
        setIsVideoEnabled(!isVideoEnabled);
        console.log(`视频已${track.enabled ? '开启' : '关闭'}`);
      } else {
        console.warn('未找到视频轨道');
      }
    } else {
      console.warn('本地流未初始化');
    }
  };

  // 切换扬声器
  const toggleSpeaker = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
      });
      setIsSpeakerOn(!isSpeakerOn);
    } catch (err) {
      console.error('切换扬声器失败:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} className="">
        <Text style={styles.headerText}>王小明</Text>
      </View>

      <View
        style={[
          styles.profileContainer,
          {
            opacity: isCallActive ? 1 : 0,
            pointerEvents: isCallActive ? 'auto' : 'none'
          }
        ]}
        className=" ">
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.timeText}>{formatCallTime(callTime)}</Text>
      </View>

      <View className="" style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
          <Text style={styles.buttonText}>语音</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
          <Ionicons name={isVideoEnabled ? 'videocam' : 'videocam-off'} size={24} color="white" />
          <Text style={styles.buttonText}>视频</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hangupButton} onPress={endCall}>
          <Ionicons name="call" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
          <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-mute'} size={24} color="white" />
          <Text style={styles.buttonText}>扬声器</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="camera-reverse" size={24} color="white" />
          <Text style={styles.buttonText}>反转镜头</Text>
        </TouchableOpacity>
      </View>

      <View 
        style={[
          styles.buttonContainer, 
          { 
            opacity: !isCallActive ? 1 : 0,
            pointerEvents: !isCallActive ? 'auto' : 'none'
          }
        ]}>
        <TouchableOpacity style={styles.startCallButton} onPress={makeCall}>
          <Text style={styles.buttonText}>发起通话</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.waitCallButton} onPress={answerCall}>
          <Text style={styles.buttonText}>等待接听</Text>
        </TouchableOpacity>
      </View>
      
      <RTCView
        streamURL={remoteStream?.toURL()}
        style={[
          styles.remoteVideo, 
          { 
            opacity: remoteStream ? 1 : 0,
            pointerEvents: remoteStream ? 'auto' : 'none'
          }
        ]}
        objectFit="cover"
        className=""
      />
      <RTCView
        streamURL={localStream?.toURL()}
        style={[
          styles.localVideo, 
          { 
            opacity: localStream ? 1 : 0,
            pointerEvents: localStream ? 'auto' : 'none'
          }
        ]}
        objectFit="cover"
        className=""
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040720',
    position: 'relative',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#040720',
    elevation: 10, // Android 平台对应最高层级
  },

  localVideo: {
    position: 'absolute',
    width: 120,
    height: 160,
    top: 80,
    right: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2176FF',
    elevation: 8,
  },

  remoteVideo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    left: 0,
    elevation: 1,
  },
  avatarBorder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#2176FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  timeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100, // 距离底部的距离
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 3, // 确保控件在视频上层
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景
    padding: 10,
    borderRadius: 25,
  },
  hangupButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    zIndex: 2, // 确保按钮在视频上层
  },
  startCallButton: {
    backgroundColor: '#2176FF',
    padding: 15,
    borderRadius: 10,
  },
  waitCallButton: {
    backgroundColor: '#33AA33',
    padding: 15,
    borderRadius: 10,
  },
  hiddenVideo: {
    width: 0,
    height: 0,
  },
});

export default LocalSignalingRTC;
