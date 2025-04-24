import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import CourseCard from './CourseCard';
import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { router } from 'expo-router';
cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

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
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('1月');

  const secondaryCategories = Object.values(SecondaryCategoryType);

  const courseData = {
    [SecondaryCategoryType.WISDOM_LIGHT]: {
      [TabType.ORIGIN]: {
        content:
          '我们常常向外寻找答案，却忽略了真正的改变始于内心。**"我是⼀切的根源"**这门课程将带你回归自我，探索内在力量如何塑造外在世界。通过心理学工具、自我觉察练习和现实案例分析，你将学会：如何通过调整认知和情绪来转变困境，如何用积极信念影响人际关系与事业成果，以及如何成为生活的主动创造者而非被动接受者。\n\n这门课不仅关乎理论，更注重实践——从反思习惯到行为调整，帮助你打破固有模式，建立"由内而外"的成长逻辑。当你真正理解"自己是一切的根源"，便能以更清醒、更empowered的姿态面对人生挑战。改变，从此刻生根。',
        image: require('~/assets/images/courses/wisdom_light_image.png'),
      },
      [TabType.TEACHERS]: [
        {
          name: '番号+姓名',
          role: '首席导师',
          avatar: require('~/assets/images/courses/wisdom_light_image.png'),
          rating: 4.9,
          platform: 'XXXXXX',
          description: '学习如何培养成功者思维方式，建立正确的成功观念',
          studentCount: 1025,
        },
        {
          name: '番号+姓名',
          role: '首席导师',
          avatar: require('~/assets/images/courses/wisdom_light_image.png'),
          rating: 4.9,
          platform: 'XXXXXX',
          description: '学习如何培养成功者思维方式，建立正确的成功观念',
          studentCount: 1025,
        },
      ],
      [TabType.COURSES]: [
        {
          id: '1',
          title: '我是一切的根源',
          instructor: '张导师',
          description:
            '我们常常向外寻找答案，却忽略了真正的改变始于内心。**"我是⼀切的根源"**这门课程将带你回归自我，探索内在力量如何塑造外在世界。通过心理学工具、自我觉察练习和现实案例分析，你将学会：如何通过调整认知和情绪来转变困境，如何用积极信念影响人际关系与事业成果，以及如何成为生活的主动创造者而非被动接受者。\n这门课不仅关乎理论，更注重实践——从反思习惯到行为调整，帮助你打破固有模式，建立"由内而外"的成长逻辑。当你真正理解"自己是一切的根源"，便能以更清醒、更empowered的姿态面对人生挑战。改变，从此刻生根。',
          rating: 4.8,
          image: require('~/assets/images/courses/wisdom_light_image.png'),
          startTime: '2025年4月21日 19:30',
        },
        {
          id: '2',
          title: '心是一切的根源',
          instructor: '张导师',
          description:
            '我们常常向外寻找答案，却忽略了真正的改变始于内心。**"我是⼀切的根源"**这门课程将带你回归自我，探索内在力量如何塑造外在世界。通过心理学工具、自我觉察练习和现实案例分析，你将学会：如何通过调整认知和情绪来转变困境，如何用积极信念影响人际关系与事业成果，以及如何成为生活的主动创造者而非被动接受者。\n这门课不仅关乎理论，更注重实践——从反思习惯到行为调整，帮助你打破固有模式，建立"由内而外"的成长逻辑。当你真正理解"自己是一切的根源"，便能以更清醒、更empowered的姿态面对人生挑战。改变，从此刻生根。',
          rating: 4.8,
          image: require('~/assets/images/courses/wisdom_light_image.png'),
          startTime: '2025年4月21日 19:30',
        },
        {
          id: '3',
          title: '爱是一切的根源',
          instructor: '张导师',
          description:
            '我们常常向外寻找答案，却忽略了真正的改变始于内心。**"我是⼀切的根源"**这门课程将带你回归自我，探索内在力量如何塑造外在世界。通过心理学工具、自我觉察练习和现实案例分析，你将学会：如何通过调整认知和情绪来转变困境，如何用积极信念影响人际关系与事业成果，以及如何成为生活的主动创造者而非被动接受者。\n这门课不仅关乎理论，更注重实践——从反思习惯到行为调整，帮助你打破固有模式，建立"由内而外"的成长逻辑。当你真正理解"自己是一切的根源"，便能以更清醒、更empowered的姿态面对人生挑战。改变，从此刻生根。',
          rating: 4.8,
          image: require('~/assets/images/courses/wisdom_light_image.png'),
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

  const handleConsultPress = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowConsultModal(true);
  };

  const handlePayment = () => {
    console.log('支付咨询费用', selectedPlan, selectedTeacher?.name);
    setShowConsultModal(false);
  };

  const navigateToRegistration = () => {
    router.push('/registration');
  };

  const prices = {
    '1月': 99,
    '1季': 199,
    '1年': 299,
  };

  const renderContent = () => {
    const categoryData = courseData[secondaryCategories[activeSecondaryIndex]];

    switch (activeTab) {
      case TabType.ORIGIN:
        return (
          <View className="px-4 pt-4">
            <View className="overflow-hidden rounded-[12px]  bg-white">
              <View className='p-4'>
                <Image
                  source={categoryData[TabType.ORIGIN].image}
                  className="aspect-[330/180]  w-full rounded-[12px]"
                />
              </View>

              <View className="p-4">
                <Text className="text-[14px] leading-[20px] text-black">
                  {categoryData[TabType.ORIGIN].content}
                </Text>
              </View>
            </View>
          </View>
        );

      case TabType.TEACHERS:
        return (
          <View className="gap-2 px-4 pt-4">
            {categoryData[TabType.TEACHERS].map((teacher, index) => (
              <View key={index} className="rounded-[6px] bg-[#fff] p-4">
                <View className="flex-row">
                  <Image
                    source={teacher.avatar}
                    className="h-12 w-12 rounded-full"
                    contentFit="cover"
                  />
                  <View className="ml-3 flex-1 gap-1">
                    <Text className="text-[16px] font-bold">{teacher.name}</Text>
                    <View className="flex-row items-center">
                      <View className=" rounded-[4px] bg-[rgba(241,131,24,0.1)] px-[5px] py-[5px]">
                        <Text className="text-[12px] text-[#F18318]">{teacher.role}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable onPress={() => handleConsultPress(teacher)}>
                    <LinearGradient
                      colors={['#20B4F3', '#5762FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="w-[70px] items-center justify-center rounded-[6px] px-[5px] py-[5px]"
                      style={{
                        boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                      }}>
                      <Text className="text-[16px] font-bold text-white">咨询</Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                <Text className="mt-2 text-[14px] text-black/40">{teacher.description}</Text>
                <Text className="text-[14px] text-black/40">毕业平台：{teacher.platform}</Text>

                <View className="mt-4 rounded-[6px] bg-[rgba(20,131,253,0.05)] p-2">
                  <View className="flex-row">
                    <Text className="text-[14px] text-black/40">过往支持学员数：</Text>
                    <Text className="text-[14px] text-black">{teacher.studentCount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case TabType.COURSES:
        return (
          <ScrollView className="px-4 pt-4">
            <View className="">
              {categoryData[TabType.COURSES].map((course, index) => (
                <View key={course.id} className="mb-8">
                  {/* 课程标题栏 - 蓝色渐变背景 */}
                  <LinearGradient
                    colors={['#1483FD', '#5264FF00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center rounded-[6px] px-4 py-2">
                    <Text className="text-[18px] font-black text-white">
                      {index + 1}.{course.title}
                    </Text>
                  </LinearGradient>

                  {/* 视频部分 */}
                  <View className="mt-4  overflow-hidden py-8  ">
                    <Image
                      source={course.image}
                      className="aspect-[330/180] w-full rounded-[12px]"
                      contentFit="cover"
                    />
                  </View>

                  {/* 报读卡 */}

                  <View className="mt-4 flex-col  ">
                    <View className="border-l-4 border-[#1483FD] pl-2">
                      <Text className="text-[16px] font-bold">报读卡</Text>
                    </View>
                    <View className="w-full flex-row items-center justify-between gap-5  px-4 py-5">
                      <View className="aspect-[225/62]  w-[60%] ">
                        <Image
                          source={require('~/assets/images/do/baoming.png')}
                          className="h-full w-full"
                        />
                      </View>
                      <Pressable
                        className="flex aspect-[90/39] w-[35%] items-center justify-center rounded-[12px]"
                        onPress={navigateToRegistration}>
                        <LinearGradient
                          colors={['#FFE062', '#FF9327']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="rounded-[6px] px-[8.2vw] py-3"
                          style={{
                            boxShadow: '0px 6px 10px 0px rgba(253, 171, 20, 0.40)',
                          }}>
                          <Text className="text-[4.1vw] font-semibold text-white">去填写</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>

                  {/* 内容始终展开 */}
                  <View className="mt-4 gap-6">
                    {/* 课程预告 */}
                    {/* 视频部分 */}

                    <View className="">
                      <View className="border-l-4 border-[#1483FD] pl-2">
                        <Text className="text-[16px] font-bold">课程预告</Text>
                      </View>

                      <View className="relative mt-4 overflow-hidden rounded-[12px] bg-[#D9D9D9]">
                        <Image
                          source={course.image}
                          className="aspect-[16/9] w-full"
                          contentFit="cover"
                        />
                        <View className="absolute bottom-0 left-0  flex-row rounded-b-[12px] bg-black/10 p-4 backdrop-blur-xl">
                          <Text className="text-[12px] text-white/40">开课时间：</Text>
                          <Text className="text-[12px] text-white">{course.startTime}</Text>
                        </View>
                      </View>
                      <View className="mt-2 rounded-[12px] p-4 ">
                        <Text className="text-[14px] leading-[20px] text-black">
                          {course.description}
                        </Text>
                      </View>
                    </View>

                    {/* 毕业生分享 */}
                    <View>
                      <View className="border-l-4 border-[#1483FD] pl-2">
                        <Text className="text-[16px] font-bold">毕业生分享</Text>
                      </View>

                      <View className="mt-2 gap-2">
                        {/* 评论1 */}
                        <View className="rounded-[0px_12px_12px_12px]  pl-3">
                          <View className="mb-2 flex-row items-center">
                            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
                              <Text className="font-bold text-white">H</Text>
                            </View>
                            <Text className="ml-2 text-[12px]">Havien</Text>
                          </View>
                          <Text className="rounded-[12px] border border-[#0000001A] p-3 text-[14px] text-black">
                            真的收获很多，学习如何培养成功者思维方式，建立正确的成功观念。
                          </Text>
                        </View>

                        {/* 评论2 */}
                        <View className="rounded-[0px_12px_12px_12px]   pl-3">
                          <View className="mb-2 flex-row items-center">
                            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
                              <Text className="font-bold text-white">L</Text>
                            </View>
                            <Text className="ml-2 text-[12px]">Linda</Text>
                          </View>
                          <Text className="rounded-[12px] border border-[#0000001A] p-3 text-[14px] text-black">
                            张导师讲到真的非常好，向导师学到了很多的东西！{'\n'}
                            真的很推荐大家来体验一下张导师的课，真的会震惊到你的我保证！，向导师学到了很多的东西！
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1 px-4 ">
        {secondaryCategories.map((category, index) => (
          <SecondaryCategory
            key={category}
            title={category}
            isActive={activeSecondaryIndex === index}
            onPress={() => onSecondaryCategoryPress(index)}
          />
        ))}
      </ScrollView>

      {/* tab 栏 */}
      <View className="mb-4 mt-4 flex-row justify-start px-6">
        {Object.values(TabType).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} className="relative mr-8  py-1">
            <Text
              className={`text-[16px] ${
                activeTab === tab ? 'font-bold text-[#1483FD]' : 'text-black/50'
              }`}>
              {tab}
            </Text>
            {activeTab === tab && (
              <View className="absolute -bottom-1 left-0 flex  h-1 w-full  items-center  ">
                <View className="  h-1 w-[28px] bg-[#1483FD]" />
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {renderContent()}

      {/* 咨询弹窗 */}
      <Modal
        visible={showConsultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConsultModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-[320px] overflow-hidden rounded-[12px] bg-white">
            {/* 关闭按钮 */}
            <View className="absolute right-4 top-4 z-10">
              <Pressable className=" " onPress={() => setShowConsultModal(false)}>
                <Image source={require('~/assets/close.png')} className="h-4 w-4" />
              </Pressable>
            </View>

            {/* 导师信息 */}
            <View className="mt-4 flex-row items-center justify-center p-4">
              <Image
                source={selectedTeacher?.avatar}
                className="h-14 w-14 rounded-full"
                contentFit="cover"
              />
              <View className="ml-4 flex-col  justify-center items-center">
                <Text className="text-[18px] font-bold">{selectedTeacher?.name}</Text>
                <View className="mt-1 w-[60px] rounded-[4px] bg-[rgba(241,131,24,0.1)]  py-[2px]">
                  <Text className="text-[12px] text-[#F18318] text-center">{selectedTeacher?.role}</Text>
                </View>
              </View>
            </View>

            {/* 套餐选择 */}
            <View className="mt-4 gap-2 px-7">
              {/* 1月 */}
              <Pressable
                onPress={() => setSelectedPlan('1月')}
                className={`flex-row items-center justify-between rounded-[6px] bg-[#1483FD0D] px-4 py-3 ${
                  selectedPlan === '1月' ? 'border border-[#1483FD]' : ''
                }`}>
                <Text className="text-[16px]">1月</Text>
                <Text className="text-[20px] font-bold text-[#000]">{prices['1月']}￥</Text>
              </Pressable>

              {/* 1季 */}
              <Pressable
                onPress={() => setSelectedPlan('1季')}
                className={`flex-row items-center justify-between rounded-[6px] bg-[#1483FD0D] px-4 py-3 ${
                  selectedPlan === '1季' ? 'border border-[#1483FD]' : ''
                }`}>
                <Text className="text-[16px]">1季</Text>
                <Text className="text-[20px] font-bold text-[#1483FD]">{prices['1季']}￥</Text>
              </Pressable>

              {/* 1年 */}
              <Pressable
                onPress={() => setSelectedPlan('1年')}
                className={`flex-row items-center justify-between rounded-[6px] bg-[#1483FD0D] px-4 py-3 ${
                  selectedPlan === '1年' ? 'border border-[#1483FD]' : ''
                }`}>
                <Text className="text-[16px]">1年</Text>
                <Text className="text-[20px] font-bold text-[#F18318]">{prices['1年']}￥</Text>
              </Pressable>
            </View>

            {/* 支付按钮 */}
            <Pressable onPress={handlePayment} className="mx-4 mb-4 mt-6">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center rounded-[6px] py-3"
                style={{
                  boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                }}>
                <Text className="text-[20px] font-bold text-white">支付</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
