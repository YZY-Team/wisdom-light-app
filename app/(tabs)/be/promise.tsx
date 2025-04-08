import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Promise() {
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
        <Text className="mb-4 text-xl font-bold">我的承诺</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#2196F320]">
              <Ionicons name="book" size={20} color="#2196F3" />
            </View>
            <View>
              <Text className="text-lg font-medium">技能提升计划</Text>
              <Text className="text-sm text-gray-400">完成课程学习，掌握核心技能</Text>
            </View>
          </View>
          <View className="mb-4 border-t border-gray-100 pt-3">
            <Text className="text-sm text-gray-400">承诺内容</Text>
            <Text className="mt-2 text-base leading-6">
              在未来3个月内，通过系统学习和实践，掌握前端开发的核心技能，包括React Native、TypeScript和项目实战经验。
            </Text>
          </View>
          <View className="border-t border-gray-100 pt-3">
            <Text className="text-sm text-gray-400">学习进度</Text>
            <View className="mt-2">
              <View className="mb-2 flex-row justify-between">
                <Text className="text-base text-gray-600">课程完成率</Text>
                <Text className="text-base font-medium text-[#2196F3]">60%</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                <View className="h-full w-[60%] rounded-full bg-[#2196F3]" />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Text className="mb-4 text-xl font-bold">学习记录</Text>
        <View className="rounded-xl bg-white shadow-sm">
          {[
            { title: 'React Native基础', progress: 100, status: '已完成' },
            { title: 'TypeScript入门到实践', progress: 80, status: '学习中' },
            { title: '项目实战课程', progress: 30, status: '学习中' },
          ].map((course, index) => (
            <View
              key={course.title}
              className={`border-b border-gray-100 p-4 ${index === 2 ? 'border-b-0' : ''}`}
            >
              <View className="mb-2 flex-row justify-between">
                <Text className="text-base">{course.title}</Text>
                <Text
                  className={`text-sm font-medium ${course.status === '已完成' ? 'text-[#4CAF50]' : 'text-[#2196F3]'}`}
                >
                  {course.status}
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <View
                  className={`h-full rounded-full ${course.status === '已完成' ? 'bg-[#4CAF50]' : 'bg-[#2196F3]'}`}
                  style={{ width: `${course.progress}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}