import React from 'react';
import { Text } from 'react-native';
import { Bubble, BubbleProps } from 'react-native-gifted-chat';
import { IAudioMessage } from './types';

export const renderBubble = (props: BubbleProps<IAudioMessage>) => {
  const { currentMessage, position, previousMessage } = props;
  
  const isSameThread = previousMessage 
    && previousMessage.user 
    && currentMessage 
    && currentMessage.user 
    && previousMessage.user._id === currentMessage.user._id 
    && previousMessage.createdAt 
    && currentMessage.createdAt 
    && new Date(previousMessage.createdAt).toDateString() === new Date(currentMessage.createdAt).toDateString();

  // 消息样式
  const bubbleStyle = {
    left: {
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      padding: 8,
      marginBottom: 2,
      marginLeft: 8,
      marginRight: 0,
    },
    right: {
      backgroundColor: '#1483FD',
      borderRadius: 6,
      padding: 8,
      marginBottom: 2,
      marginLeft: 0,
      marginRight: 8,
    },
  };

  // 文本样式
  const textStyle = {
    left: {
      color: '#333333',
      fontSize: 15,
    },
    right: {
      color: '#FFFFFF',
      fontSize: 15,
    },
  };

  // 用户名样式
  const usernameStyle = {
    left: {
      color: '#555',
      fontWeight: 'bold' as const,
      fontSize: 14,
      marginBottom: 3,
    },
    right: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: 'bold' as const,
      fontSize: 14,
      marginBottom: 3,
    }
  };

  // 渲染用户名
  const renderUsername = () => {
    if (isSameThread) return null;
    
    if (currentMessage?.user?.name) {
      return (
        <Text style={position === 'left' ? usernameStyle.left : usernameStyle.right}>
          {currentMessage.user.name}
        </Text>
      );
    }
    return null;
  };

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: bubbleStyle.left,
        right: bubbleStyle.right,
      }}
      textStyle={{
        left: textStyle.left,
        right: textStyle.right,
      }}
      renderUsername={currentMessage?.user?._id !== (props.user?._id || '') ? renderUsername : undefined}
      containerToPreviousStyle={{
        left: { marginTop: isSameThread ? 2 : 10 },
        right: { marginTop: isSameThread ? 2 : 10 },
      }}
    />
  );
};

export default renderBubble; 