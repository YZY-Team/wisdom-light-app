import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, SafeAreaView, Modal, Dimensions } from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
// 定义WebSocket和RTCPeerConnection类型，修复TypeScript错误
type WebSocketRef = WebSocket | null;
type RTCPeerConnectionRef = RTCPeerConnection | null;
type MediaStreamType = any; // 使用any临时解决类型问题

interface WebRTCDialogProps {
  visible: boolean;
  onClose: () => void;
  callerName: string;
  callerId: string;
  isHost?: boolean;
  maxParticipants?: number;
  groupId?: string;
}

interface VideoSize {
  width: number;
  height: number;
}

const WebRTCDialog = ({ 
  visible, 
  onClose, 
  callerName, 
  callerId,
  isHost = false,
  maxParticipants = 4,
  groupId = ''
}: WebRTCDialogProps) => {
  const [localStream, setLocalStream] = useState<MediaStreamType>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStreamType>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [status, setStatus] = useState('未连接');
  const [callTime, setCallTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isLeaderMode, setIsLeaderMode] = useState(false);
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Array<any>>([]);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  const peerConnection = useRef<RTCPeerConnectionRef>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callAudioRef = useRef<Audio.Sound | null>(null);
  
  // 使用WebSocket Context
  const { sendMessage, lastMessage } = useWebSocketContext();

  // 计算视频窗口尺寸
  const calculateVideoSize = (): VideoSize => {
    const { width, height } = windowDimensions;
    const count = participants.length;
    
    if (!width || !height || !count) return { width: 150, height: 150 };

    const availableHeight = height - 200; // 减去控制栏高度

    if (isLeaderMode) {
      return {
        width: width,
        height: availableHeight - (width / 3)
      };
    } else {
      const row = Math.ceil(Math.sqrt(count));
      const col = Math.ceil(count / row);
      const vw = width / row;
      const vh = availableHeight / col;
      
      return {
        width: vw,
        height: Math.min(vh, vw * 1.2) // 保持长宽比不超过1:1.2
      };
    }
  };

  // 处理挂断信号
  const handleHangup = () => {
    endCall(); // 调用结束通话的函数
    setStatus('对方已挂断');
  };
  // 修改WebSocket相关的useEffect
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage.data);
        
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
            handleHangup();
            break;
        }
      } catch (err) {
        console.error('解析WebSocket消息失败:', err);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lastMessage]);

  // 修改所有发送WebSocket消息的地方
  const sendWebSocketMessage = (data: any) => {
    sendMessage(JSON.stringify(data));
  };

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
      ],
    });

    stream.getTracks().forEach((track: any) => {
      if (peerConnection.current) {
        peerConnection.current.addTrack(track, stream);
      }
    });

    if (peerConnection.current) {
      peerConnection.current.ontrack = (event: any) => {
        console.log('收到远程流');
        console.log('event', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log('发送ICE候选');
          sendWebSocketMessage({
            type: 'candidate',
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
          });
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

    startCallTimer();
    setIsCallActive(true);

    try {
      if (pc) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);

        sendWebSocketMessage({
          type: 'offer',
          offer: offer,
        });
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
      sendWebSocketMessage({
        type: 'answer',
        answer: answer,
      });

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

          sendWebSocketMessage({
            type: 'offer',
            offer: newOffer,
          });
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

    sendWebSocketMessage({
      type: 'hangup',
      sender: callerId,
    });

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setStatus('通话已结束');
    onClose();
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

  // 切换大小屏模式
  const toggleLeaderMode = (userId: string) => {
    if (leaderId === userId) {
      setLeaderId(null);
      setIsLeaderMode(false);
    } else {
      setLeaderId(userId);
      setIsLeaderMode(true);
    }
  };

  // 拒绝通话
  const onReject = () => {
    sendWebSocketMessage({ type: 'reject', groupId });
    onClose();
  };

  // 接受通话
  const onAccept = async () => {
    try {
      const stream = await getLocalStream();
      if (stream) {
        setLocalStream(stream);
        sendWebSocketMessage({ type: 'accept', groupId });
        setIsCallActive(true);
      }
    } catch (err) {
      console.error('接受通话失败:', err);
    }
  };

  // 取消通话
  const onCancel = () => {
    sendWebSocketMessage({ type: 'cancel', groupId });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={endCall}>
      <SafeAreaView style={styles.container}>

        {!isCallActive && !isHost && (
          <View style={styles.callBox}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.largeAvatar}
              />
              <Text style={styles.callerName}>{callerName}</Text>
            </View>
            <Text style={styles.inviteText}>邀请你加入多人通话</Text>
            {participants.length > 0 && (
              <>
                <Text style={styles.participantsText}>参与通话的还有:</Text>
                <View style={styles.participantsList}>
                  {participants.map((participant) => (
                    <Image
                      key={participant.id}
                      source={{ uri: participant.avatar }}
                      style={styles.smallAvatar}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <View style={[styles.videoContainer, isLeaderMode && styles.leaderModeContainer]}>
          {isLeaderMode ? (
            <>
              <RTCView
                streamURL={leaderId === 'local' ? localStream?.toURL() : remoteStream?.toURL()}
                style={[styles.leaderVideo, calculateVideoSize()]}
                objectFit="cover"
              />
              <View style={styles.followerContainer}>
                {/* 其他参与者的小窗口视频 */}
              </View>
            </>
          ) : (
            <View style={styles.gridContainer}>
              <RTCView
                streamURL={localStream?.toURL()}
                style={[styles.videoGrid, calculateVideoSize()]}
                objectFit="cover"
              />
              <RTCView
                streamURL={remoteStream?.toURL()}
                style={[styles.videoGrid, calculateVideoSize()]}
                objectFit="cover"
              />
              {/* 可以添加更多参与者的视频窗口 */}
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
            <Text style={styles.buttonText}>麦克风</Text>
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
            <Text style={styles.buttonText}>翻转</Text>
          </TouchableOpacity>
        </View>

        {!isCallActive && (
          <View style={styles.bottomBar}>
            {!isHost ? (
              <>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
                  <Ionicons name="close-circle" size={40} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}>
                  <Ionicons name="checkmark-circle" size={40} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onCancel}>
                <Ionicons name="close-circle" size={40} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040720',
  },
  header: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  callBox: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2176FF',
  },
  callerName: {
    color: 'white',
    fontSize: 24,
    marginTop: 16,
  },
  inviteText: {
    color: '#999',
    fontSize: 16,
    marginTop: 24,
  },
  participantsText: {
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  videoContainer: {
    flex: 1,
  },
  leaderModeContainer: {
    flexDirection: 'column',
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoGrid: {
    flex: 1,
    backgroundColor: '#000',
    minHeight: 150,
  },
  leaderVideo: {
    flex: 0.8,
    backgroundColor: '#000',
    minHeight: 200,
  },
  followerContainer: {
    flex: 0.2,
    flexDirection: 'row',
    backgroundColor: '#111',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  hangupButton: {
    backgroundColor: '#FF3B30',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CD964',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
});

export default WebRTCDialog;
