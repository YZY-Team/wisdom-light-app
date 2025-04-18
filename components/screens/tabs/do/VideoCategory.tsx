import { ScrollView, View,Text } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import CourseCard from './CourseCard';

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
  const courseData: {
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
    内在成长: [
      {
        title: '自我认知提升',
        teacher: '李导师',
        description: '探索内在潜能，建立健康的自我认知体系',
        rating: 4.7,
        image:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
    情绪处理: [
      {
        title: '情绪管理课程',
        teacher: '王导师',
        description: '掌握情绪管理技巧，提升生活质量',
        rating: 4.6,
        image:
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
    团队管理: [
      {
        title: '团队领导力',
        teacher: '赵导师',
        description: '提升团队管理能力，打造高效团队',
        rating: 4.9,
        image:
          'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
    ],
    道的部分: [
      {
        title: '道德修养',
        teacher: '陈导师',
        description: '探索传统智慧，提升个人修养',
        rating: 4.8,
        image:
          'https://images.unsplash.com/photo-1507692049790-de58290a4334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      },
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
        {courseData[secondaryCategories[activeSecondaryIndex]]?.map((course, index) => (
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
        )) || <Text className="text-center text-gray-500">暂无课程</Text>}
      </View>
    </>
  );
}
