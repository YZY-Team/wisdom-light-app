import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';
import AudioMessage from './AudioMessage';
import { IAudioMessage } from './types';

interface MessageRendererProps {
  currentMessage?: IMessage;
  previousMessage?: IMessage;
  nextMessage?: IMessage;
  user?: {
    _id: string | number;
    name?: string;
    avatar?: string;
  };
}

export const renderMessage = (props: MessageRendererProps) => {
  const { currentMessage, previousMessage, nextMessage } = props;
  
  // 如果currentMessage不存在，则返回空视图而不是null
  if (!currentMessage) return <View />;
  
  // 检查是否是同一个用户的连续消息
  const isSameUser = previousMessage && previousMessage.user && 
    previousMessage.user._id === currentMessage.user?._id;
  
  // 检查是否是同一天的消息
  const isSameDay = previousMessage && previousMessage.createdAt && currentMessage.createdAt && 
    new Date(previousMessage.createdAt).toDateString() === 
    new Date(currentMessage.createdAt).toDateString();
  
  // 组合条件：相同用户且同一天的连续消息
  const isSameThread = isSameUser && isSameDay;

  // 头像间距，连续消息的头像间距更小
  const marginBottom = nextMessage && nextMessage.user && 
    nextMessage.user._id === currentMessage.user?._id ? 2 : 10;
  
  // 自定义日期显示
  const renderDay = () => {
    if (currentMessage.createdAt) {
      // 只有不是同一天的消息才显示日期分隔线
      if (!isSameDay) {
        const date = new Date(currentMessage.createdAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateText = date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // 如果是今天或昨天，特殊处理
        if (date.toDateString() === today.toDateString()) {
          dateText = '今天';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateText = '昨天';
        }
        
        return (
          <View style={{ 
            alignItems: 'center', 
            margin: 10,
          }}>
            <Text style={{ 
              color: '#999', 
              fontSize: 12,
              backgroundColor: 'rgba(240, 240, 240, 0.7)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
            }}>
              {dateText}
            </Text>
          </View>
        );
      }
    }
    return null;
  };
  
  return (
    <View>
      {renderDay()}
      <View style={{ 
        flexDirection: 'row',
        marginBottom,
        paddingHorizontal: 8,
        alignItems: 'flex-end',
      }}>
        {/* 头像区域 */}
        <View style={{
          marginRight: 8,
          width: isSameThread ? 36 : 36,
          alignItems: 'center',
          opacity: isSameThread ? 0 : 1, // 连续消息不显示头像
        }}>
          {!isSameThread && currentMessage.user && currentMessage.user.avatar && (
            <Image 
              source={{ uri: currentMessage.user.avatar as string }}
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 4 
              }}
            />
          )}
        </View>
        
        {/* 消息内容区域 */}
        <View style={{ 
          flex: 1,
          marginTop: isSameThread ? 2 : 10,
        }}>
          {/* 用户名和时间 */}
          {!isSameThread && currentMessage.user && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 4
            }}>
              <Text style={{ 
                fontWeight: 'bold' as const, 
                fontSize: 14, 
                color: '#333' 
              }}>
                {currentMessage.user.name}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#999', 
                marginLeft: 8 
              }}>
                {new Date(currentMessage.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
          
          {/* 消息气泡 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 4,
            padding: 8,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            maxWidth: '95%',
          }}>
            {/* 文本消息 */}
            {currentMessage.text && !currentMessage?.audio && !currentMessage?.image && (
              <Text style={{ fontSize: 15, color: '#333' }}>
                {currentMessage.text}
              </Text>
            )}
            
            {/* 图片消息 */}
            {currentMessage.image && (
              <Image 
                source={{ uri: currentMessage.image as string }}
                style={{ 
                  width: 200, 
                  height: 150, 
                  borderRadius: 4,
                  marginTop: currentMessage.text ? 8 : 0,
                }}
                resizeMode="cover"
              />
            )}
            
            {/* 音频消息 */}
            {(currentMessage as IAudioMessage).audio && (
              <AudioMessage 
                currentMessage={currentMessage as IAudioMessage} 
                position="left" 
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default renderMessage; 