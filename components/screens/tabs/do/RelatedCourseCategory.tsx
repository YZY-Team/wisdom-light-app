import { ScrollView, View, Text, Pressable } from 'react-native';
import  SecondaryCategory  from './SecondaryCategory';
import  CourseCard  from './CourseCard';
import { useState } from 'react';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
cssInterop(Image, { className: 'style' });

enum SecondaryCategoryType {
  WISDOM_LIGHT = '智慧之光',
  MORAL_ENLIGHTENMENT = '德明',
  AWARENESS = '觉知',
  YOUTH_DREAM_FACTORY = '青少年梦工厂',
  READING_CLUB = '读书会',
  YOUTH_CHINA_DREAM = '少年·中国梦',
  MOTHER_WAY = '娘道',
  PRACTITIONER = '践行者',
  HEAVEN_WAY = '天道·言人事',
}

enum TabType {
  ORIGIN = '缘起',
  TEACHERS = '导师团',
  COURSES = '课程介绍',
}

type RelatedCourseCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
};

export default function RelatedCourseCategory({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
}: RelatedCourseCategoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ORIGIN);
  const secondaryCategories = Object.values(SecondaryCategoryType);

  const courseData = {
    [SecondaryCategoryType.WISDOM_LIGHT]: {
      [TabType.ORIGIN]: {
        content: '我们常常向外寻找答案，却忽略了真正的改变始于内心...',
        image: 'path_to_image',
      },
      [TabType.TEACHERS]: [
        {
          name: '张导师',
          role: '首席导师',
          avatar: 'path_to_avatar',
          rating: 4.9,
        },
      ],
      [TabType.COURSES]: [
        {
          title: '我是一切的根源',
          teacher: '张导师',
          description: '探索如何跳出思维定式...',
          rating: 4.8,
          image: 'path_to_course_image',
          startTime: '2025年4月21日 19:30',
        },
      ],
    },
    [SecondaryCategoryType.MORAL_ENLIGHTENMENT]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.AWARENESS]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.YOUTH_DREAM_FACTORY]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.READING_CLUB]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.YOUTH_CHINA_DREAM]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.MOTHER_WAY]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.PRACTITIONER]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
    [SecondaryCategoryType.HEAVEN_WAY]: {
      [TabType.ORIGIN]: { content: '', image: '' },
      [TabType.TEACHERS]: [],
      [TabType.COURSES]: [],
    },
  };

  const renderContent = () => {
    const categoryData = courseData[secondaryCategories[activeSecondaryIndex]];

    switch (activeTab) {
      case TabType.ORIGIN:
        return (
          <View className="p-4">
            <Image
              source={{ uri: categoryData[TabType.ORIGIN].image }}
              className="mb-4 h-48 w-full rounded-lg"
            />
            <Text className="text-base leading-6">{categoryData[TabType.ORIGIN].content}</Text>
          </View>
        );

      case TabType.TEACHERS:
        return (
          <View className="p-4">
            {categoryData[TabType.TEACHERS].map((teacher, index) => (
              <View key={index} className="mb-4 flex-row items-center">
                <Image source={{ uri: teacher.avatar }} className="h-12 w-12 rounded-full" />
                <View className="ml-3">
                  <Text className="font-bold">{teacher.name}</Text>
                  <Text className="text-gray-600">{teacher.role}</Text>
                  <View className="flex-row">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Text key={i} className="text-yellow-400">
                          ★
                        </Text>
                      ))}
                    <Text className="ml-1">{teacher.rating}</Text>
                  </View>
                </View>
                <Pressable className="ml-auto rounded bg-blue-500 px-4 py-2">
                  <Text className="text-white">咨询</Text>
                </Pressable>
              </View>
            ))}
          </View>
        );

      case TabType.COURSES:
        return (
          <View className="px-4 pt-4">
            {categoryData[TabType.COURSES].map((course, index) => (
              <CourseCard
                key={index}
                title={course.title}
                teacher={course.teacher}
                description={course.description}
                rating={course.rating}
                image={course.image}
                teacherAvatar=""
                teacherRole=""
                teacherId=""
                platform=""
              />
            ))}
          </View>
        );
    }
  };

  return (
    <>
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

      {/* 修改 tab 栏样式 */}
      <View className="mt-4 flex-row justify-start gap-8 px-6">
        {Object.values(TabType).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="relative py-1">
            <Text
              className={`text-center text-[16px] ${
                activeTab === tab ? 'text-[#1483FD]' : 'text-black/50'
              }`}>
              {tab}
            </Text>
            {activeTab === tab && (
              <View className="absolute bottom-0 left-1/2 h-1 w-7 -translate-x-1/2 bg-[#1483FD]" />
            )}
          </Pressable>
        ))}
      </View>

      {renderContent()}
    </>
  );
};
