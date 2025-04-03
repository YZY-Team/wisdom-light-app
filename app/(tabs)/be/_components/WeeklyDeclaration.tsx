import { View, Text, Pressable, ScrollView } from 'react-native';

export default function WeeklyDeclaration() {
  return (
    <ScrollView className="flex-1 px-4">
      {/* 数据统计区域 */}
      <View className="flex-row flex-wrap justify-between py-4">
        <View className="mb-4 w-[48%] rounded-xl bg-white p-4">
          <Text className="text-center text-3xl font-bold text-blue-500">89</Text>
          <Text className="mt-1 text-center text-sm text-gray-500">完成宣告</Text>
        </View>
        <View className="mb-4 w-[48%] rounded-xl bg-white p-4">
          <Text className="text-center text-3xl font-bold text-purple-500">12</Text>
          <Text className="mt-1 text-center text-sm text-gray-500">课程学习</Text>
        </View>
        <View className="w-[48%] rounded-xl bg-white p-4">
          <Text className="text-center text-3xl font-bold text-green-500">8</Text>
          <Text className="mt-1 text-center text-sm text-gray-500">成就解锁</Text>
        </View>
        <View className="w-[48%] rounded-xl bg-white p-4">
          <Text className="text-center text-3xl font-bold text-blue-500">80%</Text>
          <Text className="mt-1 text-center text-sm text-gray-500">目标达成率</Text>
        </View>
      </View>

      {/* 任务列表 */}
      <Text className="mb-4 text-xl font-bold">总数据</Text>
      <View className="mb-4 rounded-xl bg-white">
        <Pressable className="border-b border-gray-100 p-4">
          <Text className="mb-1 text-base font-semibold">坚持不懈</Text>
          <Text className="text-sm text-gray-500">连续30天完成日宣告</Text>
          <Text className="mt-1 text-xs text-gray-400">开始于 2023/4/15</Text>
        </Pressable>
        <Pressable className="border-b border-gray-100 p-4">
          <Text className="mb-1 text-base font-semibold">求知若渴</Text>
          <Text className="text-sm text-gray-500">完成6门课程学习</Text>
          <Text className="mt-1 text-xs text-gray-400">开始于 2023/3/22</Text>
        </Pressable>
        <Pressable className="p-4">
          <Text className="mb-1 text-base font-semibold">团队领袖</Text>
          <Text className="text-sm text-gray-500">完成团队管理系列全部课程</Text>
          <Text className="mt-1 text-xs text-gray-400">开始于 2023/4/1</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}