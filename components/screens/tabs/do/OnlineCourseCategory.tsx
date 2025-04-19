import { ScrollView, View } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import CourseCard from './CourseCard';

type OnlineCourseCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
  courses: any[];
};

export default function OnlineCourseCategory({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
}: OnlineCourseCategoryProps) {
  const secondaryCategories = ['课程预告', '已预约'];
  
  const courseData: {
    [key: string]: Array<{
      title: string;
      instructor: string;
      description: string;
      startTime: string;
      enrolledCount: number;
      maxEnrollment: number;
      price: number;
      instructorTitle: string;
      platform: string;
      isBooked: boolean;
    }>
  } = {
    课程预告: [
      {
        title: '情绪处理',
        instructor: '张导师',
        description: '成功者的思维方式并非与生俱来，而是可以通过系统训练培养的认知习惯。要建立正确的成功观念，首先需要破除"成功等于财富地位"的单一认知，真正理解成功是目标达成、价值实现与自我成长的复合体。培养成长型思维是基础，将挑战视为进步契机，把失败看作反馈信息，这种认知转换能显著提升抗挫能力。同时要建立"结果导向"的思考模式，以终为始地拆解目标，通过OKR等工具将愿景转化为可执行步骤。',
        startTime: '2025/03/02 12：00',
        enrolledCount: 23,
        maxEnrollment: 99,
        price: 199,
        instructorTitle: '首席导师',
        platform: 'xxxxxx',
        isBooked: false
      },
      {
        title: '自我提升',
        instructor: '李导师',
        description: '掌握自我提升的科学方法，建立个人成长体系，实现持续性进步。学习如何养成高效学习习惯，提高时间管理能力，增强自我驱动力。',
        startTime: '2025/03/15 14：30',
        enrolledCount: 18,
        maxEnrollment: 50,
        price: 149,
        instructorTitle: '高级讲师',
        platform: 'xxxxxx',
        isBooked: false
      }
    ],
    已预约: [
      {
        title: '团队管理',
        instructor: '王导师',
        description: '学习现代团队管理理论与实践，掌握团队建设、激励和冲突处理技巧。培养高效沟通能力，建立信任与合作的团队文化。',
        startTime: '2025/02/28 10：00',
        enrolledCount: 32,
        maxEnrollment: 40,
        price: 299,
        instructorTitle: '资深导师',
        platform: 'xxxxxx',
        isBooked: true
      }
    ]
  };

  // 处理预约事件
  const handleReserve = () => {
    console.log('用户点击了预约按钮');
    // 这里可以添加预约逻辑
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
      <ScrollView className="px-4 pt-4">
        {courseData[secondaryCategories[activeSecondaryIndex]].map((course, index) => (
          <CourseCard
            key={index}
            title={course.title}
            instructor={course.instructor}
            description={course.description}
            startTime={course.startTime}
            enrolledCount={course.enrolledCount}
            maxEnrollment={course.maxEnrollment}
            price={course.price}
            instructorTitle={course.instructorTitle}
            platform={course.platform}
            isBooked={course.isBooked}
            onReserve={handleReserve}
          />
        ))}
      </ScrollView>
    </>
  );
}