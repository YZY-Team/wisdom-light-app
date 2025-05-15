import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatToolbarProps {
  isRecording: boolean;
  onPickImage: () => void;
  onToggleRecording: () => void;
}

export const ChatToolbar = ({ isRecording, onPickImage, onToggleRecording }: ChatToolbarProps) => {
  return (
    <View className="mx-4 mb-2 flex-row justify-around rounded-lg bg-white p-4">
      <TouchableOpacity onPress={onPickImage} className="items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="image" size={24} color="#1483FD" />
        </View>
        <Text className="mt-1 text-xs text-gray-600">图片</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleRecording}
        className="items-center">
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}>
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={24}
            color={isRecording ? '#FF0000' : '#1483FD'}
          />
        </View>
        <Text className="mt-1 text-xs text-gray-600">
          {isRecording ? '松开结束' : '按住说话'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatToolbar; 