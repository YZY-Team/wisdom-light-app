import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import  PrimaryCategory  from './_components/PrimaryCategory';
import  VideoCategory from './_components/VideoCategory';
import  OnlineCourseCategory  from './_components/OnlineCourseCategory';
import  RelatedCourseCategory  from './_components/RelatedCourseCategory';
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


  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2 ">
          <TextInput
            className="ml-2 flex-1 text-black/40"
            placeholder="搜索课程..."
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* 一级分类 */}
      <View className="mx-5 flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
        <PrimaryCategory
          title="学习视频"
          isActive={activePrimaryIndex === 0}
          onPress={() => setActivePrimaryIndex(0)}
        />
        <PrimaryCategory
          title="线上课程"
          isActive={activePrimaryIndex === 1}
          onPress={() => setActivePrimaryIndex(1)}
        />
        <PrimaryCategory
          title="相关课程"
          isActive={activePrimaryIndex === 2}
          onPress={() => setActivePrimaryIndex(2)}
        />
      </View>

      {/* 根据一级分类显示不同内容 */}
      {activePrimaryIndex === 0 && (
        <VideoCategory
          activeSecondaryIndex={activeSecondaryIndices[0]}
          onSecondaryCategoryPress={(index) => handleSecondaryCategory(index)}
          courses={courseData['成功学']}
        />
      )}
      {activePrimaryIndex === 1 && (
        <OnlineCourseCategory
          activeSecondaryIndex={activeSecondaryIndices[1]}
          onSecondaryCategoryPress={(index) => handleSecondaryCategory(index)}
          courses={[]}
        />
      )}
      {activePrimaryIndex === 2 && (
        <RelatedCourseCategory
          activeSecondaryIndex={activeSecondaryIndices[2]}
          onSecondaryCategoryPress={(index) => handleSecondaryCategory(index)}

        />
      )}
    </ScrollView>
  );
}
