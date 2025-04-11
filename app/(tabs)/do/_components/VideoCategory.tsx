import { ScrollView, View } from 'react-native';
import  SecondaryCategory  from './SecondaryCategory';
import  CourseCard  from './CourseCard';

type VideoCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
  courses: any[];
};

export default function VideoCategory({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
}: VideoCategoryProps) {
  const secondaryCategories = ['成功学', '内在成长', '情绪处理', '团队管理', '道的部分'];
  const courseData:{
    [key: string]: {
      title: string;
      teacher: string;
      description: string;
      rating: number;
      image: string;
    }[];
  } = {
    成功学: [
      {
        title: '成功心态培养',
        teacher: '张导师',
        description: '通过系统化的学习，培养积极正向的成功心态，建立自信心和行动力。',
        rating: 4.8,
        image:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      },
      // ... other courses ...
    ],
    // ... other categories ...
  };
  return (
    <>
      {/* 二级分类 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 px-4 py-2">
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
