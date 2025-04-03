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
    activeIcon: beActiveIcon
  },
  { 
    name: 'do', 
    title: 'DO', 
    icon: doIcon,
    activeIcon: doActiveIcon
  },
  { 
    name: 'have', 
    title: 'HAVE', 
    icon: haveIcon,
    activeIcon: haveActiveIcon
  },
  { 
    name: 'ai', 
    title: 'AI', 
    icon: aiIcon,
    activeIcon: aiActiveIcon
  },
  { 
    name: 'who', 
    title: 'WHO', 
    icon: whoIcon,
    activeIcon: whoActiveIcon
  },
] as const;

export default function TabLayout() {
  const { colors } = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <Tabs>
      <View style={{ flex: 1 }}>
        <TabSlot />
      </View>

      <TabList
        className="flex flex-row justify-between    bg-white dark:bg-gray-700"
        style={{ paddingBottom: insets.bottom }}>
        {TABS.map((tab) => {
          const isActive = pathname.includes(`/${tab.name}`);
          return (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={`/(tabs)/${tab.name}`}
              className={`flex flex-1 items-center justify-center py-2 ${isActive ? 'bg-primary/10' : ''}`}>
              <View className="flex flex-1 flex-col items-center justify-center gap-1">
                {/* 在 TabTrigger 组件中修改 Image 部分 */}
                <Image 
                  source={isActive ? tab.activeIcon : tab.icon} 
                  className="h-6 w-6" 
                  contentFit="cover" 
                />
                <Text
                  className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {tab.title}
                </Text>
              </View>
            </TabTrigger>
          );
        })}
      </TabList>
    </Tabs>
  );
}
