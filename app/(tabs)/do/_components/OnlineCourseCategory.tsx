import { ScrollView, View } from 'react-native';
import { SecondaryCategory } from './SecondaryCategory';
import { CourseCard } from './CourseCard';

type OnlineCourseCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
  courses: any[];
};

export const OnlineCourseCategory = ({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
  courses,
}: OnlineCourseCategoryProps) => {
  const secondaryCategories = ['课程预告', '已预约'];
  
  const courseData = {
    课程预告: [
      // ... add course data here ...
    ],
    已预约: [
      // ... add course data here ...
    ]
  };

  return (
    <>
      {/* 二级分类 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 py-2 px-4">
        {secondaryCategories.map((category, index) => (
          <SecondaryCategory
            key={category}
            title={category}
            isActive={activeSecondaryIndex === index}
            onPress={() => onSecondaryCategoryPress(index)}
          />
        ))}
      </ScrollView>

      {/* 课程列表 */}
      <View className="px-4 pt-4">
        {courseData[secondaryCategories[activeSecondaryIndex]].map((course, index) => (
          <CourseCard
            teacherAvatar=""
            teacherRole=""
            teacherId=""
            platform=""
            key={index}
            title={course.title}
            teacher={course.teacher}
            description={course.description}
            rating={course.rating}
            image={course.image}
          />
        ))}
      </View>
    </>
  );
};