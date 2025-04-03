import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
type CategoryProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};
cssInterop(Image, { className: 'style' });
const Category = ({ title, isActive, onPress }: CategoryProps) => (
  <Pressable
    onPress={onPress}
    className={`mr-2 rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
    <Text className={`${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
      {title}
    </Text>
  </Pressable>
);

type CourseCardProps = {
  title: string;
  teacher: string;
  description: string;
  rating: number;
  href: Href;
  image: string;
};

const CourseCard = ({ title, teacher, description, rating, href, image }: CourseCardProps) => (
  <Link href={href} asChild>
    <Pressable className="mb-4 flex-row overflow-hidden rounded-xl bg-white dark:bg-gray-800">
      <View className="w-1/2 p-4">
        <View className="mb-3 flex-row items-center">
          <Ionicons name="book-outline" size={24} color="#007AFF" />
          <Text className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
        </View>
        <View className="mb-2 flex-row items-center">
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">{teacher}</Text>
        </View>
        <Text className="mb-3 text-gray-600 dark:text-gray-400" numberOfLines={2}>
          {description}
        </Text>
        <View className="flex-row items-center">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < rating ? 'star' : 'star-outline'}
              size={16}
              color="#facc15"
            />
          ))}
          <Text className="ml-2 text-sm text-gray-500">{rating.toFixed(1)}</Text>
        </View>
      </View>
      <View className="flex w-1/2  items-center  justify-center overflow-hidden ">
        <Image
          source={{ uri: image }}
          className="aspect-[1.5] w-[90%]  rounded-[6px]"
          contentFit="cover"
          onLoad={() => console.log('Image loaded successfully')}
          onError={(error) => console.error('Image loading error:', error)}
        />
      </View>
    </Pressable>
  </Link>
);

const courseData = {
  成功学: [
    {
      title: '成功心态培养',
      teacher: '张导师',
      description: '通过系统化的学习，培养积极正向的成功心态，建立自信心和行动力。',
      rating: 4.8,
      href: '/do/1',
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

export default function DoIndex() {
  const [activeCategory, setActiveCategory] = useState('成功学');

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      {/* 搜索栏 */}
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-white px-4 py-2 dark:bg-gray-800">
          <TextInput
            className="ml-2 flex-1 text-gray-900 dark:text-white"
            placeholder="搜索课程..."
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* 分类列表 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 px-4">
        <Category
          title="成功学"
          isActive={activeCategory === '成功学'}
          onPress={() => handleCategoryPress('成功学')}
        />
        <Category
          title="内在成长"
          isActive={activeCategory === '内在成长'}
          onPress={() => handleCategoryPress('内在成长')}
        />
        <Category
          title="情绪处理"
          isActive={activeCategory === '情绪处理'}
          onPress={() => handleCategoryPress('情绪处理')}
        />
        <Category
          title="团队管理"
          isActive={activeCategory === '团队管理'}
          onPress={() => handleCategoryPress('团队管理')}
        />
        <Category
          title="道的部分"
          isActive={activeCategory === '道的部分'}
          onPress={() => handleCategoryPress('道的部分')}
        />
      </ScrollView>

      {/* 课程列表 */}
      <View className="px-4">
        {courseData[activeCategory as keyof typeof courseData].map((course, index) => (
          <CourseCard
            key={index}
            title={course.title}
            teacher={course.teacher}
            description={course.description}
            rating={course.rating}
            href={course.href as Href}
            image={course.image}
          />
        ))}
      </View>
    </ScrollView>
  );
}
