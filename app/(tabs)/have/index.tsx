import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatList from './_components/ChatList';
import TabBar from './_components/TabBar';
import { useRouter } from 'expo-router';

export default function HaveIndex() {
  const router = useRouter();

  return (
    <View className="flex-1 px-4">
      {/* 搜索栏 */}
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-white px-4 py-2 dark:bg-gray-800">
          <TextInput
            className="ml-2 flex-1 text-gray-900 dark:text-white"
            placeholder="搜索用户，对话或群聊"
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>
      <TabBar />
      <ChatList />
    </View>
  );
}
