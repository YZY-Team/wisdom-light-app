import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Send,
  SendProps,
  InputToolbar,
  InputToolbarProps,
  Composer,
  ComposerProps,
  ActionsProps,
} from 'react-native-gifted-chat';
import { IAudioMessage } from './types';

// 自定义渲染发送按钮
export const renderSend = (props: SendProps<IAudioMessage>) => {
  return (
    <Send
      {...props}
      containerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
      }}>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </View>
    </Send>
  );
};

// 自定义输入工具栏
export const renderInputToolbar = (props: InputToolbarProps<IAudioMessage>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: 'white',
        borderTopWidth: 0,
        borderRadius: 12,
        marginHorizontal: 10,
        marginBottom: 4,
        shadowColor: 'rgba(82, 100, 255, 0.10)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        paddingVertical: 4,
      }}
      primaryStyle={{ alignItems: 'center' }}
    />
  );
};

// 自定义文本输入区域
export const renderComposer = (props: ComposerProps) => {
  return (
    <Composer
      {...props}
      textInputStyle={{
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        marginLeft: 0,
      }}
      placeholder="请输入消息..."
      placeholderTextColor="#999"
    />
  );
};

// 自定义输入工具栏操作区域
export const renderActions = (props: ActionsProps, toggleToolbar: () => void) => {
  return (
    <View className="ml-2 flex-row items-center">
      <TouchableOpacity
        onPress={toggleToolbar}
        className="mr-2">
        <Ionicons name="add-circle-outline" size={24} color="#1483FD" />
      </TouchableOpacity>
    </View>
  );
}; 