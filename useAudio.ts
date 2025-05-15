/*
 * @Author       : 尚博信_王强 wangqiang03@sunboxsoft.com
 * @Date         : 2025-04-23 10:43:18
 * @LastEditors  : 尚博信_王强 wangqiang03@sunboxsoft.com
 * @LastEditTime : 2025-05-15 13:39:51
 * @FilePath     : /JMZHAC/src/hooks/useAudio.ts
 * @Description  :
 *
 * Copyright (c) 2025 by 尚博信_王强, All Rights Reserved.
 */
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState, useRef, useCallback} from 'react';
import {Audio, InterruptionModeAndroid, InterruptionModeIOS} from 'expo-av';
import {Alert, AppState, Platform, PermissionsAndroid} from 'react-native';
import Toast from 'react-native-root-toast';

import {Loading} from '../components/Loading';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Audio as CompressorAudio} from 'react-native-compressor';
import InputDialog from '../components/InputDialog';
import {UploadAttachmentNew,UploadJinmaAudio} from '../utils/API';
import LottieView from 'lottie-react-native';


//针对安卓的前台服务
let ReactNativeForegroundService:any = null;
if (Platform.OS === 'android') {
  ReactNativeForegroundService =
    require('@supersami/rn-foreground-service').default;
} else {
  ReactNativeForegroundService = null;
}

//针对录音的配置，为了减少录音大小，降低采样率，降低比特率
const VOICE_RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  keepAudioActiveHint: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 8000, // 电话语音质量，足够清晰人声
    numberOfChannels: 1, // 单声道
    bitRate: 12200, // AMR-NB 标准比特率
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

interface RecordItem {
  uri: string;
  duration: number;
  startTime: number;
  name: string;
  size: number;
}

let baseUrl = 'https://salescdp.chinajinmao.cn:8001/uat';

export const useAudio = (relationId:string) => {
  
  const navigation = useNavigation();
  const [recording, setRecording] = useState<Audio.Recording>();
  const [sound, setSound] = useState<Audio.Sound>(); // 新增状态保存声音对象
  const [isPlaying, setIsPlaying] = useState(false); // 新增状态保存播放状态
  const [playbackPosition, setPlaybackPosition] = useState(0); // 新增状态保存播放位置
  const [playbackDuration, setPlaybackDuration] = useState(0); // 新增状态保存总时长
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | undefined>(''); // 新增状态保存录音文件URI
  const [pause, setPause] = useState(false);
  const [filePath, setFilePath] = useState(''); //保存录音文件的地址
  const [recordingDuration, setRecordingDuration] = useState(0); // 添加录音时长状态
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 用于存储计时器的引用
  const [playbackFinished, setPlaybackFinished] = useState(false);
  // 添加记录录音开始时间的状态
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const animationRef = useRef<LottieView | null>(null);
  //存放录音的 list
  const [recordList, setRecordList] = useState<RecordItem[]>([]);
  const rowRefs = useRef<any[]>([]);
  const listRef = useRef<RecordItem[]>([]);
  const selectedRef = useRef<number[]>([]);
  // 添加一个状态来控制是否允许多行同时打开
  const [allowMultipleOpen, setAllowMultipleOpen] = useState(false);
  // 添加选中项的状态
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  //进度
  const [progress, setProgress] = useState({
    received:0,
    total:1,
    progress:0,
    isShow:false
  });

  useEffect(() => {
    requestPermissionAsync();
    

    return () => {
      if (Platform.OS === 'android') {
        ReactNativeForegroundService.stop();
      }
    };
  }, []);

  //权限获取
  const requestPermissionAsync = async () => {

    async function ensureAudio() {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
       
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
   
    //@ts-ignore
    if (Platform.Version >= 33) {
      const response = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
     
      if (response !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }
   
    if (Platform.OS === 'android' && await ensureAudio()) {
      await ReactNativeForegroundService.start({
        id: 1, // 通知 ID，随意但要唯一
        title: '准备录音', // 通知标题
        message: '智慧案场正在运行，请勿杀死应用', // 通知内容
        icon: 'ic_notification',
        largeIcon: 'img', // 通知图标（需在 drawable 中提供）
        ServiceType: 'microphone', // ★ 必填：前台服务类型（此处为录音）
      });
    }
   
  }

  // 在组件卸载时清除所有计时器和资源
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
      // 确保前台服务被停止
      if (recording && Platform.OS === 'android') {
        ReactNativeForegroundService.stop();
      }
    };
  }, [sound, recording]);

  useEffect(() => {
    if (recordList.length > 0) {
      console.log('recordList 已更新:', recordList);
      listRef.current = recordList;
    }
  }, [recordList]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      console.log('selectedItems 已更新:', selectedItems);
      selectedRef.current = selectedItems;
    }
  }, [selectedItems]);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        // 如果没有正在进行的录音，直接允许离开
        if (!recording) {
          return;
        }
        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert('确定要离开当前页面吗？', '你如果离开，录音将停止', [
          {text: '不离开', style: 'cancel', onPress: () => {}},
          {
            text: '离开',
            style: 'destructive',
            onPress: () => {
              // 先停止录音，然后再离开页面
              if (recording) {
                stopRecording().then(() => {
                  navigation.dispatch(e.data.action);
                });
              } else {
                navigation.dispatch(e.data.action);
              }
            },
          },
        ]);
      }),
    [navigation, recording], // 添加 recording 作为依赖项
  );

  // 监听应用状态变化
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('应用从后台回到前台');
        // 如果正在录音且未暂停，更新录音时长
        if (recording && recordingStartTime && !pause) {
          const elapsedSeconds = Math.floor(
            (Date.now() - recordingStartTime) / 1000,
          );
          setRecordingDuration(elapsedSeconds);
          // 重新启动计时器
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          timerRef.current = setInterval(() => {
            setRecordingDuration(prev => {
              const newDuration = Math.floor(
                (Date.now() - recordingStartTime) / 1000,
              );
              return newDuration;
            });
          }, 1000);
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [recording, recordingStartTime, pause]);

  //开始录音
  async function startRecording() {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(undefined);
      }
      setAudioUri(undefined);
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      setIsPlaying(false);
      setFilePath('');

     
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      try {
        if (Platform.OS === 'android') {
          // 1. 启动前台服务并指定 serviceType
          await ReactNativeForegroundService.update({
            id: 1,
            title: '正在录音',
            message: '智慧案场正在录音，请勿杀死应用',
            icon: 'ic_notification',
            largeIcon: 'img',
            ServiceType: 'microphone',
          });
        }

        console.log('Starting recording..');
        const {recording} = await Audio.Recording.createAsync(
          VOICE_RECORDING_OPTIONS,
          // Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        console.log('Recording started');

        // 记录录音开始时间
        const startTime = Date.now();
        setRecordingStartTime(startTime);
        animationRef.current?.play();
        // 重置并启动计时器
        setRecordingDuration(0);
        timerRef.current = setInterval(() => {
          setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
      } catch (e) {
        console.log('启动前台服务或录音失败', e);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  //停止录音
  async function stopRecording() {
    console.log('Stopping recording..');
    // Loading.showCustomLoad('正在停止录音');
    // 停止计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 重置录音开始时间
    setRecordingStartTime(null);

    // 检查 recording 是否存在
    if (!recording) {
      console.log('No active recording to stop');
      return;
    }

    // 重置暂停状态
    setPause(false);

    try {
      // 先停止录音
      await recording.stopAndUnloadAsync();

      // 获取录音文件 URI
      const uri = recording.getURI();
      console.log('原始录音文件路径:', uri);

      // 确保 URI 存在
      if (!uri) {
        console.error('录音 URI 为空');
        setRecording(undefined);
        return;
      }

      // 保存 URI 到状态
      setAudioUri(uri);
      setRecording(undefined);

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('Recording stopped and stored at', uri);

      // 创建声音对象
      try {
        const {sound} = await Audio.Sound.createAsync({uri: uri});
        setSound(sound);
        console.log('Sound object created');
        // 在后台进行压缩处理
        compressAudioInBackground(uri);
      } catch (soundError) {
        console.error('创建声音对象失败:', soundError);
        Toast.show('创建声音对象失败');
      }

      // 停止前台服务
      if (Platform.OS === 'android') {
        ReactNativeForegroundService.stop();
      }
      animationRef.current?.reset();
    } catch (error) {
      console.error('停止录音失败:', error);
      Toast.show('停止录音失败');
      setRecording(undefined);
    }
  }

  //在后台处理音频压缩
  async function compressAudioInBackground(uri: string) {
    try {
      Loading.showCustomLoad('正在优化录音文件,请稍候...');
      // 获取原始文件大小
      let originalSize = 0;
      try {
        let path = uri;
        if (Platform.OS === 'ios' && path.startsWith('file://')) {
          path = path.replace('file://', '');
        }
        const stats = await ReactNativeBlobUtil.fs.stat(path);
        originalSize = stats.size;
        console.log(`原始录音文件大小: ${formatFileSize(originalSize)}`);
      } catch (error) {
        console.error('获取原始文件大小失败:', error);
      }

      let finalUri = uri;
      let compressedUri = '';
      // 检查压缩后的文件大小
      let compressedSize = 0;
      // 尝试压缩文件
      try {
        if (Platform.OS === 'android') {
          compressedUri = await CompressorAudio.compress(uri, {
            bitrate: 12000, // 降低至与录音参数相近
            quality: 'low', // 使用低质量
            samplerate: 8000, // 与录音参数一致
            channels: 1,
          });
          // console.log('压缩后的文件路径:', compressedUri);
          finalUri = compressedUri;
        } else {
          compressedUri = await CompressorAudio.compress(uri, {
            bitrate: 24000, // 提高比特率
            quality: 'low', // 使用低质量
            samplerate: 16000, // 提高采样率
            channels: 1,
          });
          console.log('压缩后的录音文件路径:', compressedUri);
        }

      
        try {
          let path = compressedUri;
          if (Platform.OS === 'ios' && path.startsWith('file://')) {
            path = path.replace('file://', '');
          }
          const stats = await ReactNativeBlobUtil.fs.stat(path);
          compressedSize = stats.size;
          console.log(`压缩后文件大小: ${formatFileSize(compressedSize)}`);
        } catch (error) {
          console.error('获取压缩文件大小失败:', error);
        }

        // 只有当压缩后的文件确实变小时才使用压缩后的文件
        if (compressedSize > 0 && compressedSize < originalSize) {
          console.log(
            `压缩成功，文件减小了 ${formatFileSize(
              originalSize - compressedSize,
            )}`,
          );
          finalUri = compressedUri;
          Toast.show('音频优化完成', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
          });
        } else {
          console.log('压缩后文件没有变小或获取大小失败，使用原始文件');
          finalUri = uri;
        }
      } catch (compressError) {
        console.error('压缩录音文件失败，详细错误:', compressError);
        Toast.show(`压缩失败`, {
          position: Toast.positions.CENTER,
        });
        // 如果压缩失败，使用原始文件
        finalUri = uri;
      }
      // 更新音频URI和声音对象
      setAudioUri(finalUri);
      // 如果当前没有播放，则更新声音对象
      if (!isPlaying) {
        if (sound) {
          await sound.unloadAsync();
        }
        const {sound: newSound} = await Audio.Sound.createAsync({
          uri: finalUri,
        });
        setSound(newSound);
        console.log('压缩后的声音对象已更新');
      }
      //添加录音到 list 中 ,包含uri,duration,startTime
      const record = {
        uri: finalUri,
        duration: recordingDuration,
        startTime: recordingStartTime,
        name: `录音文件 ${Math.floor(Math.random() * 1000000000)}`,
        size: compressedSize,
      };

      // setRecordList([...recordList,record]);
      //@ts-ignore
      setRecordList(prevList => {
        const newList = [...prevList, record];
        console.log('录音已添加到列表中，新列表:', newList);
        return newList;
      });
      console.log('录音已添加到列表中', recordList);
    } catch (error) {
      console.error('显示加载中提示失败:', error);
      Toast.show('录音文件压缩失败', {
        position: Toast.positions.CENTER,
      });
    } finally {
      Loading.hidden();
    }
  }

  // 辅助函数：格式化文件大小
  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  //暂停声音
  async function pauseSound() {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      // 不要重置播放位置，只改变播放状态
    }
  }

  // 播放声音
  async function playSound(uri?: string) {
    console.log('Playing sound with uri:', uri);
    try {
      // 重置播放完成状态
      setPlaybackFinished(false);

      // 如果传入了特定的URI，使用它；否则使用当前的audioUri
      const audioUriToPlay = uri || audioUri;

      // 如果当前正在播放，且要播放的是同一个文件，则暂停
      if (sound && isPlaying && audioUriToPlay === audioUri) {
        await pauseSound();
        return;
      }

      // 如果当前有声音在播放，但要播放的是不同文件，先停止当前播放
      if (sound && isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
      }

      // 更新当前音频URI
      setAudioUri(audioUriToPlay);

      // 如果没有可播放的URI，提示用户
      if (!audioUriToPlay) {
        Toast.show('没有可以播放的录音文件');
        console.log('没有可用的录音文件');
        return;
      }

      // 处理声音对象
      if (sound) {
        // 如果URI变了，需要重新加载
        if (audioUriToPlay !== audioUri) {
          await sound.unloadAsync();
          const {sound: newSound} = await Audio.Sound.createAsync({
            uri: audioUriToPlay,
          });
          setSound(newSound);

          // 设置播放状态监听
          setupPlaybackStatusListener(newSound);

          await newSound.playAsync();
          setIsPlaying(true);
        } else {
          // URI没变，使用现有sound对象
          const status = await sound.getStatusAsync();

          if (status.isLoaded) {
            // 检查是否已经播放完毕
            if (status.didJustFinish || playbackPosition >= playbackDuration) {
              console.log('播放已完成，重置位置');
              await sound.setPositionAsync(0);
              setPlaybackPosition(0);
            }

            // 设置播放状态监听
            setupPlaybackStatusListener(sound);

            // 从当前位置继续播放
            await sound.playAsync();
            setIsPlaying(true);
          } else {
            // 如果未加载或已卸载，重新创建并播放
            const {sound: newSound} = await Audio.Sound.createAsync(
              {uri: audioUriToPlay},
              {
                positionMillis:
                  playbackPosition > 0 && playbackPosition < playbackDuration
                    ? playbackPosition * 1000
                    : 0,
              },
            );

            setSound(newSound);
            setupPlaybackStatusListener(newSound);
            await newSound.playAsync();
            setIsPlaying(true);
          }
        }
      } else {
        // 如果没有sound对象，创建新的sound对象
        const {sound: newSound} = await Audio.Sound.createAsync({
          uri: audioUriToPlay,
        });

        setSound(newSound);
        setupPlaybackStatusListener(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放录音失败:', error);
      Toast.show('播放录音失败');

      // 出错时重置状态
      setIsPlaying(false);
    }
  }

  // 辅助函数：设置播放状态监听
  function setupPlaybackStatusListener(soundObj: Audio.Sound) {
    soundObj.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.durationMillis) {
        setPlaybackPosition(status.positionMillis / 1000);
        setPlaybackDuration(status?.durationMillis / 1000);

        if (status.isPlaying) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);

          // 如果播放结束，重置位置和状态
          if (status.didJustFinish) {
            console.log('播放结束，重置状态');
            stopSound();
          }
        }
      }
    });
  }

  // 修改 stopSound 函数，确保完全重置状态
  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0); // 确保位置重置到开始
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlaybackFinished(true); // 设置播放已完成状态
    }
  }

  // 暂停录音
  async function pauseRecording() {
    if (!recording) {
      console.log('没有正在进行的录音');
      return;
    }

    try {
      console.log('暂停录音...');
      // 停止计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 暂停录音
      await recording.pauseAsync();
      setPause(true);
      animationRef.current?.pause();
      // 更新前台服务通知（如果在Android上）
      if (Platform.OS === 'android') {
        await ReactNativeForegroundService.update({
          id: 1,
          title: '录音已暂停',
          message: '点击继续录音',
          icon: 'ic_notification',
          largeIcon: 'img',
          ServiceType: 'microphone',
        });
      }

      console.log('录音已暂停');
      Toast.show('录音已暂停', {
        position: Toast.positions.CENTER,
      });
    } catch (error) {
      console.error('暂停录音失败:', error);
      Toast.show('暂停录音失败，可能是您的设备不支持此功能');
      // 如果是Android API版本低于24的错误，提示用户
      if (Platform.OS === 'android' && Platform.Version < 24) {
        Toast.show('您的Android设备版本可能低于7.0，不支持暂停录音', {
          position: Toast.positions.CENTER,
        });
      }
    }
  }

  // 继续录音
  async function resumeRecording() {
    if (!recording || !pause) {
      console.log('没有暂停的录音');
      return;
    }

    try {
      console.log('继续录音...');

      // 继续录音
      await recording.startAsync();
      setPause(false);
      animationRef.current?.resume();
      // 更新前台服务通知（如果在Android上）
      if (Platform.OS === 'android') {
        await ReactNativeForegroundService.update({
          id: 1,
          title: '正在录音',
          message: '智慧案场正在录音，请勿杀死应用',
          icon: 'ic_notification',
          largeIcon: 'img',
          ServiceType: 'microphone',
        });
      }

      // 重新启动计时器
      const currentTime = Date.now();
      const elapsedTime = recordingDuration * 1000; // 转换为毫秒
      const adjustedStartTime = currentTime - elapsedTime;
      setRecordingStartTime(adjustedStartTime);

      timerRef.current = setInterval(() => {
        setRecordingDuration(
          Math.floor((Date.now() - adjustedStartTime) / 1000),
        );
      }, 1000);

      console.log('录音已继续');
      Toast.show('录音已继续', {
        position: Toast.positions.CENTER,
      });
    } catch (error) {
      console.error('继续录音失败:', error);
      Toast.show('继续录音失败', {
        position: Toast.positions.CENTER,
      });
    }
  }

  //下载和上传录音
  async function uploadFile(item: RecordItem) {
    console.log('Uploading file');
    // 这里添加使用RNFetchBlob保存文件的代码
    try {
      // Loading.showCustomLoad('正在保存录音文件');
      // 创建一个永久存储的目录
      // const dirs = ReactNativeBlobUtil.fs.dirs;
      // const audioDir = `${dirs.DocumentDir}/recordings`;

      // // 确保目录存在
      // const exists = await ReactNativeBlobUtil.fs.exists(audioDir);
      // if (!exists) {
      //   await ReactNativeBlobUtil.fs.mkdir(audioDir);
      // }
      const fileType = item.uri.split('.').pop()
      const timestamp = Date.now();
      // // 生成一个唯一的文件名
      const fileName = `${item.name}_${timestamp}.${fileType}`;
      // const destPath = `${audioDir}/${fileName}`;

      // // 修改这里：正确处理iOS文件路径
      // let sourcePath = url;
      // if (Platform.OS === 'ios' && sourcePath.startsWith('file://')) {
      //   // 对于iOS，需要正确处理文件路径
      //   // 方法1：使用完整路径，但去掉file://前缀
      //   sourcePath = sourcePath.replace('file://', '');
      // }

      // console.log('源文件路径:', sourcePath);
      // console.log('目标文件路径:', destPath);

      // // 检查目标文件是否已存在
      // const destExists = await ReactNativeBlobUtil.fs.exists(destPath);
      // if (destExists) {
      //   // 如果在iOS上文件已存在，先删除它
      //   await ReactNativeBlobUtil.fs.unlink(destPath);
      //   console.log('已删除现有文件:', destPath);
      // }
      // // 复制文件从临时位置到永久存储
      // await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
      // console.log('录音文件已永久保存至:', destPath);
      // // 显示成功提示
      // // Toast.show(`录音文件已永久保存至:${destPath}`, {
      // //   position: Toast.positions.CENTER,
      // // });
      // setFilePath(destPath);
      // console.log('文件已保存至:', destPath);
       // 修改这里：正确处理iOS文件路径
       let sourcePath = item.uri;
       if (Platform.OS === 'ios' && sourcePath.startsWith('file://')) {
         // 对于iOS，需要正确处理文件路径
         // 方法1：使用完整路径，但去掉file://前缀
         sourcePath = sourcePath.replace('file://', '');
       }
      //获取文件大小
      let compressedSize = item.size;
      try {
        // const stats = await ReactNativeBlobUtil.fs.stat(destPath);
        // compressedSize = stats.size;
        console.log(`文件大小: ${formatFileSize(compressedSize)}`);
         // 上传文件到OSS
        uploadAudio(sourcePath, fileName, compressedSize, fileType, (data) => {
          console.log('上传成功:', data);
          let params = {
            oppId:relationId,
            filedId:data.id,
          }
          Loading.showCustomLoad('加载中...');
          UploadJinmaAudio(params).then((res:any)=>{
            console.log('uploadJinmaAudio',res);
            if(res.code == 1000){
              setProgress(prev=>({...prev,isShow:false}))
              Toast.show('录音上传成功', {
                position: Toast.positions.CENTER,
              });
            }
          }).finally(()=>{
            Loading.hidden();
          })
        }, (error) => {
          console.error('上传失败:', error);
          setProgress(prev=>({...prev,isShow:false}))
          Toast.show(`录音上传失败: ${error}`, {
            position: Toast.positions.CENTER,
          });
        })
      } catch (error) {
        console.error('获取文件大小失败:', error);
      }
     
      //清空选中的录音
      setSelectedItems([]);
      selectedRef.current = []; 
      rowRefs.current.forEach((ref, i) => {
        ref.close();
      });

      // return destPath;
    } catch (error) {
      console.error('保存文件失败:', error);
      Toast.show(`保存文件失败`);
      return null;
    } finally {
      Loading.hidden();
    }
  }

  //上传音频到服务器
  async function uploadAudio(
    realPath?: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string,
    onSuccess?: (data: any) => void,
    onError?: (error: any) => void,
  ) {
    const uploadUrl =
      baseUrl +
      '/api/Sales/common/GeneratePresignedUri' +
      `?fileName=${encodeURIComponent(fileName || '')}.${fileType}&uploadType=19`;

    if (!realPath) return false;

    console.log('参数打印', uploadUrl,realPath)

    fetch(uploadUrl, {
      method: 'GET',
      headers: {
        //@ts-ignore
        Authorization: global.userToken as string,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('responseJson', responseJson);
        if (responseJson.code === 1000 && responseJson.data.url) {
          console.log('responseJson.data', responseJson.data.url);
          const fileId = responseJson.data.fileId; //文件id,上传成功后需要传给后台
          let startTime = new Date().getTime();
          console.log('开始上传的时间', new Date().getTime());
          ReactNativeBlobUtil.fetch('PUT',responseJson.data.url,
            {'Content-Type': 'application/octet-stream',},
            ReactNativeBlobUtil.wrap(decodeURIComponent(realPath)))
          .uploadProgress(
            {count: 10, interval: -1},
            (received, total) => {
              console.log(`上传进度: ${received}/${total}`);
              setProgress({
                received,
                total,
                progress: Math.round((received / total) * 100),
                isShow: true,
              });
            },
          )
           
            .then(res => {
              console.log('OSS上传成功', JSON.stringify(res));
              console.log('上传结束的时间', new Date().getTime());
              console.log('上传耗时', new Date().getTime() - startTime);
              if (res.respInfo.status >= 200 && res.respInfo.status < 300) {
               
                if (onSuccess) {
                  const body = {
                    "FileId": fileId,
                    "uploadFileType":19,
                    "relationId":relationId,
                    "fileName":fileName,
                    "fileSize":fileSize,
                  };
                  console.log('body', body);
                  UploadAttachmentNew('UploadAttachmentNew', body)
                    .then((responseJson:any) => {
                      console.log('上传成功后的回调请求', responseJson);
                      if (responseJson.code === 1000) {
                        setTimeout(() => {
                          onSuccess(responseJson.data);
                        }, 500);
                      } else {
                        if (onError) {
                          onError('上传失败,请重新尝试');
                        }
                      }
                    })
                    .catch((error:any) => {
                      console.log('error', error);
                      if (onError) {
                        onError('上传失败');
                      }
                    });
                }
              }
            })
            .catch(err => {
              console.log('OSS上传失败', err);
            });
        } else {
          if (onError) 
          onError('获取上传的地址失败');
        }
      })
      .catch(error => {
        console.log('error', error);
        if (onError) 
        onError('获取上传的地址失败');
      });
  }

  // 添加一个处理滑块变化的函数
  const handleSliderValueChange = async (value: number) => {
    if (sound) {
      // 暂停当前播放
      if (isPlaying) {
        await sound.pauseAsync();
      }
      // 更新播放位置状态
      setPlaybackPosition(value);
    }
  };

  // 添加一个处理滑块完成滑动的函数
  const handleSlidingComplete = async (value: number) => {
    if (sound) {
      // 设置新的播放位置
      await sound.setPositionAsync(value * 1000);

      // 如果之前是播放状态，则继续播放
      if (isPlaying) {
        await sound.playAsync();
      }
    }
  };

  //删除选中的录音
  function onDeleteRecord(index: number) {
    console.log('删除录音', index);
    Alert.alert('提示', '是否要删除该录音文件', [
      {text: '取消', onPress: () => console.log('取消删除')},
      {
        text: '确定',
        onPress: () => {
          const newRecordList = recordList.filter((item, i) => i !== index);
          setRecordList(newRecordList);
          console.log('删除后的录音列表', newRecordList);
          Toast.show('删除成功', {
            position: Toast.positions.CENTER,
          });
        },
      },
    ]);
  }

  // 修改格式化时间函数，支持小时显示
  function formatTime(seconds: number) {
    if (!seconds) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  //打开编辑页面的弹框
  function openEditDialog(index: number) {
    console.log('打开编辑页面', index);
    InputDialog.show({
      title: '修改录音名称',
      placeholder: '请输入新的录音名称',
      callBack: text => {
        if (text) {
          onEditName(index, text);
        }
      },
    });
  }

  // 修改修改录音名称
  function onEditName(index: number, name: string) {
    console.log('修改录音名称', index, name);
    const newRecordList = [...recordList];
    newRecordList[index].name = name;
    setRecordList(newRecordList);
    console.log('修改后的录音列表', newRecordList);
    Toast.show('修改成功', {
      position: Toast.positions.CENTER,
    });
  }

  // 修改 handleSwipeableWillOpen 方法
  const handleSwipeableWillOpen = useCallback(
    (index: number) => {
      // 只有当不允许多行打开时，才关闭其他行
      if (!allowMultipleOpen) {
        rowRefs.current.forEach((ref, i) => {
          if (ref && i !== index && ref.close) {
            ref.close();
          }
        });
      }
    },
    [allowMultipleOpen],
  ); // 添加 allowMultipleOpen 作为依赖项

  //上传录音文件
  const handleUpload = async () => {
    console.log('recordList', listRef.current);
    if (listRef.current.length == 0) {
      Toast.show('请先录音', {
        position: Toast.positions.CENTER,
      });
      return;
    }
    //如果只有一个录音文件，直接上传
    if (listRef.current.length === 1) {
      console.log('只有一个录音文件，直接上传', listRef.current[0])
      uploadFile(listRef.current[0]);
    } else {
      console.log('selectedRef', selectedRef.current);
      const selectedRecords = selectedRef.current.map(
        index => listRef.current[index],
      );
      console.log('selectedRecords', selectedRecords);
      //如果有多个录音文件，提示用户选择上传哪个文件
      if (selectedRecords.length === 0) {
        Toast.show('请选择要上传的录音文件', {
          position: Toast.positions.CENTER,
        });
        openAllRowsLeft();
        return;
      } else {
        // 上传选中的录音文件
        //遍历选中的录音文件，上传到服务器
        for (let i = 0; i < selectedRecords.length; i++) {
          uploadFile(selectedRecords[i]);
        }
      }
    }
  };
  // 添加打开所有行左侧的方法
  const openAllRowsLeft = () => {
    console.log('尝试打开所有行的左侧，当前行数:', rowRefs.current.length);

    // 设置允许多行同时打开
    setAllowMultipleOpen(true);

    // 使用延时依次打开所有行
    rowRefs.current.forEach((ref, index) => {
      if (ref && ref.openLeft) {
        setTimeout(() => {
          ref.openLeft();
          console.log(`打开第 ${index + 1} 行的左侧`);
        }, index * 100); // 每个行延迟100毫秒打开
      }
    });

    // 延迟一段时间后恢复单行打开模式
    setTimeout(() => {
      setAllowMultipleOpen(false);
    }, rowRefs.current.length * 100 + 500); // 给足够的时间让所有行打开
  };

  // 处理选择/取消选择的方法
  const handleSelectItem = (index: number) => {
    console.log('选择/取消选择项目:', index);
    setSelectedItems(prevSelected => {
      // 如果已经选中，则取消选择
      if (prevSelected.includes(index)) {
        const newSelected = prevSelected.filter(item => item !== index);
        console.log('取消选择后的列表:', newSelected);
        selectedRef.current = newSelected;
        return newSelected;
      }
      // 否则添加到选中列表
      else {
        const newSelected = [index];
        console.log('选择后的列表:', newSelected);
        return newSelected;
      }
    });
  };

  // 检查项目是否被选中
  const isItemSelected = (index: number) => {
    return selectedItems.includes(index);
  };

  // 获取选中的项目
  const getSelectedItems = () => {
    return selectedRef.current.map(index => recordList[index]);
  };

  return {
    recording,
    isPlaying,
    pause,
    sound,
    recordingDuration,
    playbackPosition,
    playbackDuration,
    audioUri,
    filePath,
    playbackFinished,
    animationRef,
    recordList,
    rowRefs,
    progress,
    setAudioUri,
    setFilePath,
    startRecording,
    stopRecording,
    pauseSound,
    playSound,
    pauseRecording,
    resumeRecording,
    stopSound,
    uploadFile,
    formatTime,
    handleSliderValueChange,
    handleSlidingComplete,
    handleSwipeableWillOpen,
    onDeleteRecord,
    onEditName,
    handleUpload,
    openEditDialog,
    handleSelectItem,
    isItemSelected,
    getSelectedItems,
  };
};
