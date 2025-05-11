import { ScrollView, View, Text } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import CourseCard from './CourseCard';
import { useBookedOnlineCourses, useUpcomingOnlineCourses } from '~/queries/onlineCourse';
import { LoadingSpinner } from '~/components/common/LoadingSpinner';

// 定义在线课程的类型
interface OnlineCourse {
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
}

// 定义接口返回的数据类型
interface ApiResponse {
  code: number;
  message: string;
  data: {
    records: OnlineCourse[];
    pagination: {
      total: string;
      size: string;
      current: string;
      pages: string;
    };
  };
}

type OnlineCourseCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
};

export default function OnlineCourseCategory({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
}: OnlineCourseCategoryProps) {
  const secondaryCategories = ['课程预告', '已预约'];
  
  // 获取即将开始的课程
  const { data: upcomingCourses, isLoading: isLoadingUpcoming, refetch: refetchUpcomingCourses } = useUpcomingOnlineCourses();
  
  // 获取已预约的课程
  const { data: bookedCourses, isLoading: isLoadingBooked, refetch: refetchBookedCourses } = useBookedOnlineCourses();

  // 处理预约事件
  const handleReserve = () => {
    console.log('用户点击了预约按钮');
    // 这里可以添加预约逻辑
  };

  // 如果正在加载，显示加载状态
  if (isLoadingUpcoming || isLoadingBooked) {
    return <LoadingSpinner />;
  }

  // 获取当前分类的课程列表
  const getCurrentCourses = () => {
    const currentData = activeSecondaryIndex === 0 ? upcomingCourses : bookedCourses;
    return (currentData as ApiResponse)?.data?.records || [];
  };

  const currentCourses = getCurrentCourses();
  console.log('currentCourses', currentCourses);
  return (
    <>
      {/* 二级分类 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1 px-4">
        {secondaryCategories.map((category, index) => (
          <SecondaryCategory
            key={category}
            title={category}
            isActive={activeSecondaryIndex === index}
            onPress={() => {
              onSecondaryCategoryPress(index)
              if (index === 0) {
                refetchUpcomingCourses();
              } else {
                refetchBookedCourses();
              }
            }}
          />
        ))}
      </ScrollView>

      {/* 课程列表 */}
      <ScrollView className="px-4 pt-4">
        {currentCourses.length > 0 ? (
          currentCourses.map((course: OnlineCourse) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.teacherName}
              description={course.description}
              startTime={course.startTime}
              enrolledCount={course.reservationCount}
              maxEnrollment={99} // 这个值需要后端提供
              price={course.price}
              coverUrl={course.coverUrl}
              instructorTitle={course.teacherLevel}
              platform={course.graduationPlatform}
              isBooked={activeSecondaryIndex === 1}
              onReserve={handleReserve}
            />
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-4">暂无课程</Text>
        )}
      </ScrollView>
    </>
  );
}