import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  href: Href;
  showBorder?: boolean;
};

const MenuItem = ({ icon, title, href, showBorder = true }: MenuItemProps) => (
  <Link href={href} asChild>
    <Pressable
      className={`flex-row items-center px-4 py-3 ${showBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
      <Ionicons name={icon} size={20} color="#007AFF" />
      <Text className="ml-3 flex-1 text-gray-900 dark:text-white">{title}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#666" />
    </Pressable>
  </Link>
);

export default function WhoIndex() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* 个人信息卡片 */}
      <View className="mb-6 bg-white p-6 dark:bg-gray-800">
        <View className="mb-4 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Ionicons name="camera-outline" size={32} color="#666" />
          </View>
          <Text className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Rhea</Text>
          <Text className="text-gray-500">ID: WL78901234</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className="mx-4 rounded-xl bg-white dark:bg-gray-800">
        <MenuItem icon="home-outline" title="通用设置" href="/(tabs)/who/general" />
        <MenuItem icon="chatbubble-outline" title="人工客服" href="/(tabs)/who/support" />
        <MenuItem icon="card-outline" title="会员充值" href="/(tabs)/who/membership" />
        <MenuItem
          icon="person-outline"
          title="成为导师"
          href="/(tabs)/who/become-mentor"
          showBorder={false}
        />
      </View>

      {/* 版本信息 */}
      <Text className="mb-4 mt-8 text-center text-xs text-gray-400">Wisdom Light v1.0.0</Text>
    </ScrollView>
  );
}
