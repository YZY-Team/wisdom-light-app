import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Achievement() {
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
        <Text className="mb-4 text-xl font-bold">创造成果</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F4433620]">
              <Ionicons name="rocket" size={20} color="#F44336" />
            </View>
            <View>
              <Text className="text-lg font-medium">项目成果</Text>
              <Text className="text-sm text-gray-400">展示个人项目和贡献</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="mb-4 text-xl font-bold">项目列表</Text>
        <View className="space-y-4">
          {[
            {
              title: '智慧光明APP',
              description: '基于React Native的移动应用开发',
              contribution: '负责前端界面开发和功能实现',
              status: '进行中',
              date: '2024/1/15',
            },
            {
              title: '数据可视化平台',
              description: '企业级数据分析展示系统',
              contribution: '开发核心数据展示模块',
              status: '已完成',
              date: '2023/12/20',
            },
            {
              title: '在线学习平台',
              description: '基于Web的在线教育系统',
              contribution: '实现用户学习追踪功能',
              status: '已完成',
              date: '2023/11/10',
            },
          ].map((project) => (
            <View key={project.title} className="rounded-xl bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-medium">{project.title}</Text>
                <Text
                  className={`text-sm font-medium ${project.status === '已完成' ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}
                >
                  {project.status}
                </Text>
              </View>
              <Text className="mb-2 text-base text-gray-600">{project.description}</Text>
              <Text className="mb-3 text-base text-gray-600">{project.contribution}</Text>
              <Text className="text-sm text-gray-400">更新时间：{project.date}</Text>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-4 text-xl font-bold">成果统计</Text>
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-3">
            <Text className="text-base text-gray-600">完成项目</Text>
            <Text className="text-base font-medium text-[#F44336]">2</Text>
          </View>
          <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-3">
            <Text className="text-base text-gray-600">进行中项目</Text>
            <Text className="text-base font-medium text-[#F44336]">1</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base text-gray-600">贡献代码</Text>
            <Text className="text-base font-medium text-[#F44336]">10,000+</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}