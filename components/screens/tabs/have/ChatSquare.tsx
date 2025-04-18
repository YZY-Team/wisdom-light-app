import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type MessageProps = {
  avatar: string;
  name: string;
  message: string;
  time: string;
  isMe?: boolean;
};

const Message = ({ avatar, name, message, time, isMe = false }: MessageProps) => (
  <View className={`mb-4 flex-row ${isMe ? 'flex-row-reverse' : ''}`}>
    <Image source={{ uri: avatar }} className="h-8 w-8 rounded-full" />
    <View className={`max-w-[70%] ${isMe ? 'mr-3' : 'ml-3'}`}>
      {!isMe && <Text className="mb-1 text-sm text-gray-600">{name}</Text>}
      <View className={`rounded-2xl p-3 ${isMe ? 'bg-blue-500' : 'bg-white dark:bg-gray-800'}`}>
        <Text className={`text-sm ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {message}
        </Text>
      </View>
      <Text className={`mt-1 text-xs text-gray-500 ${isMe ? 'text-right' : ''}`}>{time}</Text>
    </View>
  </View>
);

export default function ChatSquare() {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={90}>
      <View className="flex-1 rounded-[12px] bg-gray-100">
        <Text className="py-4 text-center text-gray-400">欢迎来到聊天广场，请文明发言</Text>
        <ScrollView className="flex-1 px-4">
          <Message
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            name="Petter"
            message="大家好，有人想加入这个项目的讨论吗？"
            time="10:30"
          />
          <Message
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty"
            name="Kitty"
            message="我上周参加了一个很有意思的活动，想分享给大家！"
            time="10:32"
          />
          <Message
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea"
            name="Rhea"
            message="我上周参加了，李导师讲得很好用，强烈推荐！"
            time="10:32"
            isMe={true}
          />
        </ScrollView>
        <View className="bg-white p-4 dark:bg-gray-800">
          <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
            <TextInput
              className="flex-1 text-gray-900 dark:text-white"
              placeholder="请输入消息..."
              placeholderTextColor="#666"
            />
            <Pressable className="ml-2">
              <Ionicons name="send" size={24} color="#4F46E5" />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}