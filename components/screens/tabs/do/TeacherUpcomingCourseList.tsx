import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useTeacherUpcomingCourses } from '~/queries/onlineCourse';
import { LoadingSpinner } from '~/components/common/LoadingSpinner';
import { formatDate } from '~/utils/date';
import { router } from 'expo-router';

cssInterop(Image, { className: 'style' });

// 定义在线课程的类型
interface TeacherCourse {
  id: string;
  title: string;
  teacherName: string;
  teacherLevel: string;
  graduationPlatform: string;
  coverUrl: string;
  description: string;
  startTime: string;
  price: number;
  reservationCount: number;
  status: string;
  createTime: string;
  reserved: boolean | null;
}

// 定义接口返回的数据类型
interface ApiResponse {
  code: number;
  message: string;
  data: {
    records: TeacherCourse[];
    pagination: {
      total: string;
      size: string;
      current: string;
      pages: string;
    };
  };
}

export default function TeacherUpcomingCourseList() {
  const { data, isLoading, refetch } = useTeacherUpcomingCourses();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const courses = (data as ApiResponse)?.data?.records || [];

  return (
    <ScrollView className="flex-1 bg-[#F5F8FC]  pt-4">
      <Text className="mb-4 text-xl font-bold">待开课列表</Text>
      
      {courses.length > 0 ? (
        courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            className="mb-4 overflow-hidden rounded-lg bg-white p-4 shadow"
            onPress={() => router.push(`/do/${course.id}`)}
          >
            <View className="flex-row">
              <Image
                source={{ uri: course.coverUrl }}
                className="h-20 w-20 rounded-md"
                contentFit="cover"
              />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold" numberOfLines={1}>
                  {course.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  讲师: {course.teacherName} ({course.teacherLevel})
                </Text>
                <Text className="text-sm text-gray-600">
                  平台: {course.graduationPlatform}
                </Text>
                <Text className="text-sm text-blue-500">
                  开课时间: {formatDate(new Date(course.startTime))}
                </Text>
              </View>
            </View>
            
            <View className="mt-3">
              <Text className="text-sm text-gray-700" numberOfLines={2}>
                {course.description}
              </Text>
            </View>
            
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-orange-500">¥{course.price}</Text>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500">
                  已预约: {course.reservationCount}人
                </Text>
                <View className="ml-2 rounded-full bg-green-100 px-2 py-1">
                  <Text className="text-xs text-green-700">
                    {course.status === 'approved' ? '已审核' : '审核中'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-500">暂无待开课课程</Text>
        </View>
      )}
    </ScrollView>
  );
} 