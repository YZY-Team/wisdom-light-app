import React from 'react';
import { MessageAudioProps } from 'react-native-gifted-chat';
import AudioMessage from './AudioMessage';
import { IAudioMessage } from './types';

interface AudioMessageRendererProps {
  userGlobalId?: string;
}

export const createRenderMessageAudio = ({ userGlobalId }: AudioMessageRendererProps) => {
  return (props: MessageAudioProps<IAudioMessage>) => {
    console.log('props', props);
    if (!props || !props.currentMessage) return null;
    
    const currentMessage = props.currentMessage;
    if (currentMessage && currentMessage.audio) {
      // 判断是否是当前用户发送的消息
      console.log('currentMessage1', currentMessage);
      const isUserMessage = userGlobalId === currentMessage.user?._id;

      return (
        <AudioMessage currentMessage={currentMessage} position={isUserMessage ? 'right' : 'left'} />
      );
    }
    return null;
  };
};

export default createRenderMessageAudio; 