import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatList from '../../../components/screens/tabs/have/ChatList';
import TabBar from '../../../components/screens/tabs/have/TabBar';
import { useRouter } from 'expo-router';
import { useWebSocketStore } from '~/store/websocketStore';

export default function HaveIndex() {
  const router = useRouter();

  return (
    <View className="flex-1   bg-[#F5F8FC]">
      {/* 搜索栏 */}
      <View className="bg-white/80">
        <View className="px-4 py-4">
          <View className="flex-row items-center rounded-full  bg-[#1687fd]/5 px-4  ">
            <TextInput
              className="ml-2 flex-1 h-[30px] py-0"
              placeholder="搜索用户,对话或群聊"
              placeholderTextColor="#666"
            />
            <Ionicons name="search-outline" size={20} color="#666" />
          </View>
        </View>
        <TabBar />
      </View>
      <ChatList />
    </View>
  );
}
