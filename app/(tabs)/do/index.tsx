import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import PrimaryCategory from '../../../components/screens/tabs/do/PrimaryCategory';
import VideoCategory from '../../../components/screens/tabs/do/VideoCategory';
import OnlineCourseCategory from '../../../components/screens/tabs/do/OnlineCourseCategory';
import RelatedCourseCategory from '../../../components/screens/tabs/do/RelatedCourseCategory';
import cardImage from '~/assets/splash.png';
// 需要在文件顶部添加 LinearGradient 导入
import { LinearGradient } from 'expo-linear-gradient';
// 需要在 cssInterop 下面添加
cssInterop(LinearGradient, { className: 'style' });

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
    <ScrollView className="flex-1 bg-[#F5F8FC]">
      <View className='bg-white/80 pb-2'>
        <View className="p-4">
          <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4  ">
            <TextInput
              className="ml-2 flex-1 h-[30px] py-0"
              placeholder="搜索课程..."
              placeholderTextColor="#666"
            />
            <Ionicons name="search-outline" size={20} color="#666" />
          </View>
        </View>

        {/* 一级分类 */}
        <View className="mx-5 flex-row  justify-between rounded-[8px] bg-[#1687fd]/10 p-2">
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
      </View>

      {/* 根据一级分类显示不同内容 */}
      {activePrimaryIndex === 0 && (
        <VideoCategory
          activeSecondaryIndex={activeSecondaryIndices[0]}
          onSecondaryCategoryPress={(index) => handleSecondaryCategory(index)}
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
