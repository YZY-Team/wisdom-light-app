import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4 pt-4"
      contentContainerStyle={{
        paddingBottom: 160,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6">
        <Text className="mb-4 text-xl font-bold">个人资料</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 border-b border-gray-100 pb-3">
            <Text className="text-sm text-gray-400">用户名</Text>
            <Text className="mt-1 text-base">张三</Text>
          </View>
          <View className="mb-4 border-b border-gray-100 pb-3">
            <Text className="text-sm text-gray-400">邮箱</Text>
            <Text className="mt-1 text-base">zhangsan@example.com</Text>
          </View>
          <View className="mb-4 border-b border-gray-100 pb-3">
            <Text className="text-sm text-gray-400">手机号</Text>
            <Text className="mt-1 text-base">138****1234</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-400">注册时间</Text>
            <Text className="mt-1 text-base">2023年4月15日</Text>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="mb-4 text-xl font-bold">成就统计</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-3">
            <Text className="text-base text-gray-600">完成宣告</Text>
            <Text className="text-base font-medium text-[#1483FD]">89</Text>
          </View>
          <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-3">
            <Text className="text-base text-gray-600">课程学习</Text>
            <Text className="text-base font-medium text-[#1483FD]">12</Text>
          </View>
          <View>
            <Text className="text-base text-gray-600">成就解锁</Text>
            <Text className="text-base font-medium text-[#1483FD]">8</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}