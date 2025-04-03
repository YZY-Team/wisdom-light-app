import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';

type TabProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

const Tab = ({ title, icon, href }: TabProps) => (
  <Link href={href} asChild>
    <Pressable className="flex-1 items-center transition-all duration-200">
      <View className="w-full items-center py-2">
        <Ionicons name={icon} size={24} color="#666" />
        <Text className="mt-1 text-xs font-medium text-gray-600">{title}</Text>
      </View>
    </Pressable>
  </Link>
);

export default function TabBar() {
  return (
    <View className="flex-row bg-[#1687fd]/10 gap-[8px] p-2 rounded-[8px]">
      <Tab
        title="添加好友"
        icon="person-add-outline"
        href="/have/add-friend"
      />
      <Tab
        title="发起群聊"
        icon="people-outline"
        href="/have/create-group"
      />
      <Tab
        title="聊天广场"
        icon="chatbubbles-outline"
        href="/have/chat-square"
      />
      <Tab
        title="视频会议"
        icon="videocam-outline"
        href="/have/video-meeting"
      />
      <Tab
        title="寻找支持"
        icon="help-circle-outline"
        href="/have/find-support"
      />
    </View>
  );
}