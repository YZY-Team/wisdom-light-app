import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import aiLogo from '~/assets/images/ai/logo.png';

const Message = ({ isAI, content, time }: { isAI: boolean; content: string; time: string }) => (
  <View className={`flex-row ${isAI ? '' : 'flex-row-reverse'} mb-4`}>
    {isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant' }}
        className="h-10 w-10 rounded-full bg-blue-100"
      />
    )}
    <View
      className={`mx-3 max-w-[70%] ${isAI ? 'bg-white' : 'bg-blue-500'} rounded-2xl p-4 shadow-sm`}>
      <Text className={`text-base ${isAI ? 'text-gray-800' : 'text-white'}`}>{content}</Text>
    </View>
    {!isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }}
        className="h-10 w-10 rounded-full bg-gray-100"
      />
    )}
  </View>
);

// AI助手卡片组件
const AiCard = ({ title, icon }: { title: string; icon: string }) => (
  <Link href="/ai/chat" asChild>
    <Pressable className="mr-4 items-center rounded-xl bg-[#F5F8FF] p-4">
      <Image source={{ uri: icon }} className="h-16 w-16 rounded-2xl" contentFit="cover" />
      <Text className="mt-2 text-sm text-[#333]">{title}</Text>
    </Pressable>
  </Link>
);

export default function AiIndex() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
          <TextInput
            className="ml-2 flex-1 text-black/40"
            placeholder="搜索ai"
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* AI助手列表 */}
      <View className="px-4">
        <Text className="mb-4 text-base font-medium">AI助手</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AiCard
            title="Open AI"
            icon="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
          />
          <AiCard title="Deep Seek" icon="https://example.com/deep-seek-icon.png" />
          <AiCard title="Deep Seek" icon="https://example.com/deep-seek-icon.png" />
        </ScrollView>
      </View>

      {/* AI导师列表 */}
      <View
        className="absolute  mt-6  w-full   px-4 "
        style={{
          bottom: 20,
        }}>
        <View className=' bg-[#1483fd]/5 rounded-[6px]'>
          <Link href="/ai/tutor" asChild>
            <Pressable className="flex-row items-center rounded-xl  p-4">
              <Image source={aiLogo} className="h-12 w-12 rounded-full" />
              <Text className="ml-3 text-base font-medium">AI导师</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
                style={{ marginLeft: 'auto' }}
              />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
