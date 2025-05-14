import { IMessage } from 'react-native-gifted-chat';

// 定义包含音频属性的消息接口
export interface IAudioMessage extends IMessage {
  audio?: string;
} 