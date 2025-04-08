import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Oath() {
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
        <Text className="mb-4 text-xl font-bold">我的约誓</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#4CAF5020]">
              <Ionicons name="star" size={20} color="#4CAF50" />
            </View>
            <View>
              <Text className="text-lg font-medium">每日学习打卡</Text>
              <Text className="text-sm text-gray-400">坚持每天学习，提升自我</Text>
            </View>
          </View>
          <View className="mb-4 border-t border-gray-100 pt-3">
            <Text className="text-sm text-gray-400">约誓内容</Text>
            <Text className="mt-2 text-base leading-6">
              我承诺每天至少投入2小时进行学习，包括观看课程视频、完成练习题和阅读相关资料。通过持续的学习，不断提升自己的知识水平和技能。
            </Text>
          </View>
          <View className="border-t border-gray-100 pt-3">
            <Text className="text-sm text-gray-400">进度追踪</Text>
            <View className="mt-2">
              <View className="mb-2 flex-row justify-between">
                <Text className="text-base text-gray-600">已坚持天数</Text>
                <Text className="text-base font-medium text-[#4CAF50]">15天</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                <View className="h-full w-[75%] rounded-full bg-[#4CAF50]" />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Text className="mb-4 text-xl font-bold">打卡记录</Text>
        <View className="rounded-xl bg-white shadow-sm">
          {[
            { date: '2024/1/15', duration: '2.5小时', content: '完成React基础课程学习' },
            { date: '2024/1/14', duration: '2小时', content: '学习JavaScript进阶内容' },
            { date: '2024/1/13', duration: '3小时', content: '完成TypeScript入门课程' },
          ].map((record, index) => (
            <View
              key={record.date}
              className={`border-b border-gray-100 p-4 ${index === 2 ? 'border-b-0' : ''}`}
            >
              <View className="mb-2 flex-row justify-between">
                <Text className="text-sm text-gray-400">{record.date}</Text>
                <Text className="text-sm font-medium text-[#4CAF50]">{record.duration}</Text>
              </View>
              <Text className="text-base text-gray-600">{record.content}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}