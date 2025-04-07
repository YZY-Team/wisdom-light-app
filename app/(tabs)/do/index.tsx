import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import cardImage from '~/assets/splash.png';
// 需要在文件顶部添加 LinearGradient 导入
import { LinearGradient } from 'expo-linear-gradient';
// 需要在 cssInterop 下面添加
cssInterop(LinearGradient, { className: 'style' });
type CategoryProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

cssInterop(Image, { className: 'style' });

// 一级分类组件
const PrimaryCategory = ({ title, isActive, onPress }: CategoryProps) => (
  <Pressable
    className={`mr-4 items-center ${!isActive && 'border-b-2 border-transparent hover:bg-gray-50'}`}
    
    onPress={onPress}>
    {isActive ? (
      <LinearGradient
        colors={['#1687FD', '#20A3FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
        }}
        className="w-full items-center rounded-[6px] px-4 py-2">
        <Text className="text-base font-medium  text-white">{title}</Text>
      </LinearGradient>
    ) : (
      <View className="w-full items-center px-4 py-2">
        <Text className="text-base font-medium text-black/50">{title}</Text>
      </View>
    )}
  </Pressable>
);

// 二级分类组件
const SecondaryCategory = ({ title, isActive, onPress }: CategoryProps) => (
  <Pressable
    onPress={onPress}
    className={`mr-4 flex   items-center  rounded-[6px]`}>
    {isActive ? (
      <LinearGradient
        colors={['#20B4F3', '#5762FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
        }}
        className="w-full items-center rounded-[6px] px-4 py-2">
        <Text className="text-white ">{title}</Text>
      </LinearGradient>
    ) : (
      <Text className="px-[10px] py-2 text-[#1483FD] rounded-[6px] border border-[#1483FD]">{title}</Text>
    )}
  </Pressable>
);

type CourseCardProps = {
  title: string;
  teacher: string;
  teacherAvatar: string;
  teacherRole: string;
  teacherId: string;
  platform: string;
  description: string;
  rating: number;
  // 移除 href
  image: string;
};

const CourseCard = ({ title, teacher, description, rating, image }: CourseCardProps) => (
  <Pressable className="mb-2 flex-row justify-between overflow-hidden rounded-xl border border-black/5 bg-white dark:bg-gray-800">
    <View className="w-[65%] p-4">
      <View className="mb-3 flex flex-row items-start">
        {/* 左侧头像 */}
        <Image
          source={{ uri: cardImage }}
          className="h-12 w-12 rounded-full bg-black"
          contentFit="cover"
        />
        {/* 右侧信息 */}
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold text-gray-900">{teacher}</Text>
            <Text className="ml-2 rounded-md bg-[#FFF5E5] px-2 py-0.5 text-sm text-[#FF9500]">
              首席导师
            </Text>
          </View>
          <View className="mt-1 flex-col ">
            <Text className="text-sm text-gray-500">番号：12345464</Text>
            <Text className=" text-sm text-gray-500">毕业平台：XXXXXX</Text>
          </View>
        </View>
      </View>
      <Text className="mb-3 text-gray-600 dark:text-gray-400" numberOfLines={2}>
        {description}
      </Text>
      <View className="flex-row items-center">
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={16} color="#1483FD" />
        ))}
        <Text className="ml-2 text-sm text-gray-500">{rating.toFixed(1)}</Text>
      </View>
    </View>
    <View className="flex w-[30%] items-center  justify-center overflow-hidden ">
      <Image
        source={{ uri: image }}
        className="aspect-[100/136] w-[90%]  rounded-[6px]"
        contentFit="cover"
        onLoad={() => console.log('Image loaded successfully')}
        onError={(error) => console.error('Image loading error:', error)}
      />
    </View>
  </Pressable>
);

const courseData = {
  成功学: [
    {
      title: '成功心态培养',
      teacher: '张导师',
      description: '通过系统化的学习，培养积极正向的成功心态，建立自信心和行动力。',
      rating: 4.8,
      // 移除 href
      image:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: '目标设定与实现',
      teacher: '李导师',
      description: '科学的目标设定方法和高效执行策略讲解。',
      rating: 4.8,
      href: '/do/1',
      image:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    },
  ],
  内在成长: [],
  情绪处理: [],
  团队管理: [],
  道的部分: [],
};

const primaryCategories = ['学习视频', '线上课程', '相关课程'];
// 在 courseData 和 categories 定义之后，添加一级分类与二级分类的映射关系
const categoryMapping = {
  学习视频: ['成功学', '内在成长', '情绪处理', '团队管理', '道的部分'],
  线上课程: ['课程预告', '已预约'],
  相关课程: [
    '智慧之光',
    '德明',
    '觉知',
    '青少年梦工厂',
    '读书会',
    '少年·中国梦',
    '娘道',
    '践行者',
    '天道·言人事',
  ],
};

export default function DoIndex() {
  const [activePrimaryIndex, setActivePrimaryIndex] = useState(0);
  const [activeSecondaryIndices, setActiveSecondaryIndices] = useState({
    0: 0, // 学习视频默认选中第一个
    1: 0, // 线上课程默认选中第一个
    2: 0, // 相关课程默认选中第一个
  });

  const handleSecondaryCategory = (index: number) => {
    setActiveSecondaryIndices((prev) => ({
      ...prev,
      [activePrimaryIndex]: index,
    }));
  };

  const currentSecondaryCategories =
    categoryMapping[primaryCategories[activePrimaryIndex] as keyof typeof categoryMapping] || [];
  // 使用类型断言来确保索引访问的类型安全
  const currentActiveSecondaryIndex =
    activeSecondaryIndices[activePrimaryIndex as keyof typeof activeSecondaryIndices];
  const currentActiveSecondary = currentSecondaryCategories[currentActiveSecondaryIndex];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2 ">
          <TextInput
            className="ml-2 flex-1  text-black/40"
            placeholder="搜索课程..."
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* 一级分类 */}
      <View className="mx-5 flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
        {primaryCategories.map((category, index) => (
          <PrimaryCategory
            key={category}
            title={category}
            isActive={activePrimaryIndex === index}
            onPress={() => setActivePrimaryIndex(index)}
          />
        ))}
      </View>

      {/* 二级分类 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 py-2 px-4">
        {currentSecondaryCategories.map((category, index) => (
          <SecondaryCategory
            key={category}
            title={category}
            isActive={currentActiveSecondaryIndex === index}
            onPress={() => handleSecondaryCategory(index)}
          />
        ))}
      </ScrollView>

      {/* 课程列表 */}
      <View className="px-4 pt-4">
        {(courseData[currentActiveSecondary as keyof typeof courseData] || []).map(
          (course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              teacher={course.teacher}
              description={course.description}
              rating={course.rating}
              // 移除 href
              image={course.image}
            />
          )
        )}
      </View>
    </ScrollView>
  );
}
