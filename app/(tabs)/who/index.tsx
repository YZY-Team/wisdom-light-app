import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type MenuItemProps = {
  icon: string;
  title: string;
  href: Href;
  color?: string;
};

const MenuItem = ({ icon, title, href }: MenuItemProps) => (
  <Link href={href} asChild>
    <Pressable className="flex-row items-center px-4 py-4">
      <Image
        source={icon}
        className="h-5 w-5"
        contentFit="contain"
      />
      <Text className="ml-4 flex-1 text-[#333]">{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
    </Pressable>
  </Link>
);

export default function WhoIndex() {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#E7F2FF', '#FFF']}
        className="absolute w-full"
        style={{
          top: '22%',
          height: '78%'
        }}
      />
      <Image
        source={require('~/assets/images/who/bg.png')}
        className="absolute h-[22%] w-full"
        contentFit="cover"
      />
      <ScrollView className="flex-1">
        {/* 个人信息卡片 */}
        <View className="items-center pt-20">
          <View  className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-white">
            <Ionicons name="camera" size={24} color="#1483FD" />
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-xl font-medium text-black">Rhea</Text>
              <Ionicons name="create-outline" size={20} color="#1483FD" className="ml-1" />
            </View>
            <Text className="mt-1 text-sm text-black">ID: WL78901234</Text>
          </View>
        </View>

        {/* 功能菜单 */}
        <View style={{
            boxShadow:"0px 4px 30px 0px rgba(20, 131, 253, 0.25)"
          }} className="mx-4 mt-8 overflow-hidden rounded-xl bg-white">
          <MenuItem 
            icon={require('~/assets/images/who/settings.png')} 
            title="通用设置" 
            href="/who/general" 
          />
          <MenuItem 
            icon={require('~/assets/images/who/customer-service.png')} 
            title="人工客服" 
            href="/who/support" 
          />
          <MenuItem 
            icon={require('~/assets/images/who/vip.png')} 
            title="会员充值" 
            href="/who/membership" 
          />
          <MenuItem 
            icon={require('~/assets/images/who/join.png')} 
            title="申请入驻" 
            href="/who/become-mentor" 
          />
        </View>

        {/* 版本信息 */}
        <Text className="mb-4 mt-[220px] text-center text-xs text-[#999]">
          Wisdom Light v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
