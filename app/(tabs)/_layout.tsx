import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { useColorScheme } from '~/lib/useColorScheme';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import beIcon from '~/assets/images/tabs/be.png';
import beActiveIcon from '~/assets/images/tabs/be_active.png';
import doIcon from '~/assets/images/tabs/do.png';
import doActiveIcon from '~/assets/images/tabs/do_active.png';
import haveIcon from '~/assets/images/tabs/have.png';
import haveActiveIcon from '~/assets/images/tabs/have_active.png';
import aiIcon from '~/assets/images/tabs/ai.png';
import aiActiveIcon from '~/assets/images/tabs/ai_active.png';
import whoIcon from '~/assets/images/tabs/who.png';
import whoActiveIcon from '~/assets/images/tabs/who_active.png';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
cssInterop(Image, { className: 'style' });
const TABS = [
  {
    name: 'be',
    title: 'BE',
    icon: beIcon,
    activeIcon: beActiveIcon,
  },
  {
    name: 'do',
    title: 'DO',
    icon: doIcon,
    activeIcon: doActiveIcon,
  },
  {
    name: 'have',
    title: 'HAVE',
    icon: haveIcon,
    activeIcon: haveActiveIcon,
  },
  {
    name: 'ai',
    title: 'AI',
    icon: aiIcon,
    activeIcon: aiActiveIcon,
  },
  {
    name: 'who',
    title: 'WHO',
    icon: whoIcon,
    activeIcon: whoActiveIcon,
  },
] as const;

export default function TabLayout() {
  const { colors } = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const hideTabBarRoutes = ['/have/chat-square'];
  const shouldHideTabBar = hideTabBarRoutes.some(route => pathname.includes(route));
  return (
    <Tabs asChild>
      <View className="flex flex-1 relative flex-col bg-[#f5f5f5]">
        <View style={{ 
          flex: 1,
          // paddingBottom: bottomPadding, // 添加底部 padding
        }}>
          <TabSlot />
        </View>
        <TabList asChild>
          <View
            className="flex absolute  flex-col rounded-[20px] border border-white items-center justify-end bg-white self-center "
            style={{ 
              bottom: insets.bottom + 10,
              width: 356,
              height: 60,
              paddingHorizontal: 16,
              gap: 23,
              display: !shouldHideTabBar ?'flex' :"none",
              boxShadow: '0px 0px 10px 0px rgba(20, 131, 253, 0.25)',
            }}>
            {TABS.map((tab) => {
              const isActive = pathname.includes(`/${tab.name}`);
              return (
                <TabTrigger
                  key={tab.name}
                  name={tab.name}
                  href={`/(tabs)/${tab.name}`}
                  className={`flex flex-1 flex-col  items-center justify-center  ${isActive ? 'bg-primary/10' : ''}`}>
                  <View className="flex flex-1 flex-col items-center  justify-between gap-1">
                    {/* 在 TabTrigger 组件中修改 Image 部分 */}
                    <Image
                      source={isActive ? tab.activeIcon : tab.icon}
                      className={`h-6  ${isActive ? "" :"opacity-50"} w-6`}
                      contentFit="cover"
                    />
                    <Text
                      className={`text-[10px] font-bold ${isActive ? 'text-[#1483FD]' : 'text-gray-400'}`}
                      style={{
                        fontFamily: 'Inter',
                        lineHeight: 10, // normal 一般对应字体大小
                      }}>
                      {tab.title}
                    </Text>
                  </View>
                </TabTrigger>
              );
            })}
          </View>
        </TabList>
      </View>
    </Tabs>
  );
}
