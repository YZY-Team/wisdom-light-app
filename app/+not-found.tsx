import { Link, Stack, usePathname } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  const pathname = usePathname();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-lg">找不到页面：{pathname}</Text>
        <Text className="mt-2 text-gray-500">This screen doesn't exist.</Text>

        <Link href="/" className="m-4 py-4">
          <Text className="text-blue-500">返回首页</Text>
        </Link>
      </View>
    </>
  );
}
