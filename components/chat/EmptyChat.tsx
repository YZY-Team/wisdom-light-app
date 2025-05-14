import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyChatProps {
  loading: boolean;
}

export const renderChatEmpty = ({ loading }: EmptyChatProps) => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      transform: [{ scaleY: -1 }, { scaleX: -1 }] // 确保文本不会被颠倒
    }}>
      <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
      <Text style={{ 
        fontSize: 16,
        color: '#666', 
        marginTop: 16,
        textAlign: 'center'
      }}>
        {loading ? '正在加入聊天广场...' : '聊天广场里还没有消息，\n快来发送第一条吧!'}
      </Text>
    </View>
  );
};

export default renderChatEmpty; 