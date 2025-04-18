import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { Text, View } from 'react-native';
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

  const hideTabBarRoutes = [
    '/have/chat-square',
    '/have/add-friend',
    '/have/create-group',
    '/have/private-chat',
    '/have/video-meeting',
    '/have/find-support',
    '/who/general',
    '/who/support',
    '/who/membership',
    '/who/become-mentor',
    '/be/profile',
    '/be/oath',
    '/be/promise',
    '/be/achievement',
  ];

  // const shouldHideTabBar = hideTabBarRoutes.some((route) => pathname.includes(route));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1483FD',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: 'bold',
          lineHeight: 10,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom,
          height: 60,
          display: 'flex',
        },
        lazy: true, // 启用懒加载
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#ffffff',
            },
            tabBarIcon: ({ focused }) => (
              <View className="flex items-center justify-center gap-1">
                <Image
                  source={focused ? tab.activeIcon : tab.icon}
                  className={`h-6 w-6 ${focused ? '' : 'opacity-50'}`}
                  contentFit="cover"
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className={`text-[10px] font-bold ${focused ? 'text-[#1483FD]' : 'text-gray-400'}`}
                style={{
                  fontFamily: 'Inter',
                  lineHeight: 10,
                }}>
                {tab.title}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
