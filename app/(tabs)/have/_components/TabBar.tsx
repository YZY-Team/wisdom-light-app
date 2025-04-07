import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

// 动态引入所有图片
const tabImages = {
  '添加好友': require('~/assets/images/have/tabs/添加好友.png'),
  '发起群聊': require('~/assets/images/have/tabs/发起群聊.png'),
  '聊天广场': require('~/assets/images/have/tabs/聊天广场.png'),
  '视频会议': require('~/assets/images/have/tabs/视频会议.png'),
  '寻找支持': require('~/assets/images/have/tabs/寻找支持.png'),
};

cssInterop(Image, { className: 'style' });

const Tab = ({ title, icon, href }: TabProps) => (
  <Link href={href} asChild>
    <Pressable className="flex-1 items-center transition-all duration-200">
      <View className="w-full items-center py-2">
        <Image 
          className="w-8 h-8" 
          source={tabImages[title as keyof typeof tabImages]}
          contentFit="contain"
        />
        <Text className="mt-1 text-xs font-medium text-gray-600">{title}</Text>
      </View>
    </Pressable>
  </Link>
);

type TabProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

export default function TabBar() {
  return (
    <View style={{
      boxShadow: '0px 4px 4px 0px rgba(20, 131, 253, 0.10)',
    }} className="flex-row mb-7 bg-white gap-[8px] p-2 rounded-[8px]">
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