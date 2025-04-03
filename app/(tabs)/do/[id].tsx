import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
cssInterop(Image, { className: 'style' });
export default function CourseDetail() {
  // 这里可以根据id获取课程详情数据
  const courseData = {
    title: '成功心态培养',
    teacher: '张导师',
    description: '通过系统化的学习，培养积极正向的成功心态，建立自信心和行动力。',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    content: '课程内容详情...',
    duration: '8课时',
    students: 1234,
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <Image source={{ uri: courseData.image }} className="h-64 w-full" contentFit="cover" />

      <View className="p-4">
        <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {courseData.title}
        </Text>

        <View className="mb-4 flex-row items-center">
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">{courseData.teacher}</Text>
          <View className="ml-4 flex-row items-center">
            <Ionicons name="star" size={20} color="#facc15" />
            <Text className="ml-1 text-gray-600 dark:text-gray-400">
              {courseData.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="mb-6 flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="timer-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-600 dark:text-gray-400">{courseData.duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="home-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-600 dark:text-gray-400">
              {courseData.students}人学习
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-xl bg-white p-4 dark:bg-gray-800">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">课程简介</Text>
          <Text className="text-gray-600 dark:text-gray-400">{courseData.description}</Text>
        </View>

        <View className="rounded-xl bg-white p-4 dark:bg-gray-800">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">课程内容</Text>
          <Text className="text-gray-600 dark:text-gray-400">{courseData.content}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
