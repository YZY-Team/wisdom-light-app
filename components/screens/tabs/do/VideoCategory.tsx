import { ScrollView, View, Text, Pressable } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import vip from '~/assets/vip.png';
import { BlurView } from 'expo-blur';
import { memo, useState, useEffect } from 'react';
import { useCourseList, useCourseVideos } from '~/queries/course';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
cssInterop(Image, { className: 'style' });

// 新增 VideoDescription 组件
const VideoDescription = memo(({ description }: { description: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [textHeight, setTextHeight] = useState(0);

  // 检测文本是否需要展开按钮
  const onTextLayout = (event: any) => {
    const height = event.nativeEvent.lines.length * 20; // 假设每行高度为20
    setTextHeight(height);
    setShouldShowButton(event.nativeEvent.lines.length > 2);
  };

  if (!description) return null;

  return (
    <View>
      <Text
        className={`mt-1 text-xs text-[#00000066]`}
        numberOfLines={isExpanded ? undefined : 2}
        onTextLayout={onTextLayout}>
        {description}
      </Text>
      {shouldShowButton && (
        <Pressable onPress={() => setIsExpanded(!isExpanded)}>
          <Text className="mt-1 text-xs text-blue-500">
            {isExpanded ? '收起' : '展开'}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

const CourseItem = memo(
  ({
    title,
    description,
    courseId, // 新增 courseId 参数
    coverUrl,
  }: {
    title: string;
    description: string;
    courseId: string; // 新增 courseId 类型
    coverUrl: string;
  }) => {
    const [expanded, setExpanded] = useState(false);
    const { data: videos, isLoading } = useCourseVideos(courseId); // 使用新的查询钩子
    const router = useRouter(); // 引入 useRouter
    const videoList = videos?.data ?? [];



    return (
      <Pressable
        className="mb-4 overflow-hidden rounded-lg bg-white "
        onPress={() => setExpanded(!expanded)}>
        {/* 主内容 */}
        <View className="flex-row items-center p-2">
          <View className="relative w-[40%]">
            <Image
              source={{
                uri: coverUrl,
              }}
              className="aspect-[156/84] w-full rounded-lg"
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              priority="high"
            />
            <View className="absolute left-0 top-0 h-full items-center w-full flex-col justify-center py-2">
              {/* <View className="flex w-full items-end justify-center rounded pr-2">
                <Image
                  source={vip}
                  className="rounded-1 h-[18px] w-[36px]"
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View> */}
              <View className="h-5 w-full items-center  justify-center rounded">
                <Text className="text-[14px] font-[600] text-black">{title}</Text>
              </View>
            </View>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-[600]" numberOfLines={1}>
              {title}
            </Text>
            <Text className="mt-1 text-sm text-[#00000066]" numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>

        {/* 使用 CSS 显示/隐藏代替条件渲染 */}
        <View className={`${expanded ? 'block' : 'hidden'} p-2`}>
          {isLoading ? (
            <Text>加载中...</Text> // 修改为用 <Text> 包裹
          ) : (
            videoList.map((video, index) => (
              <Pressable key={index} onPress={(e) => e.stopPropagation()}>
                <View
                key={index}
              
                className="mb-2 flex-row items-center rounded-lg px-1">
                <View className="flex-row items-start">
                  <View>
                    <Text className="text-[#00000066]">{index + 1}</Text>
                  </View>
                  <Pressable
                    className="relative border  rounded-lg border-[#D9D9D9]/10 ml-2 w-[30%]"
                    onPress={() =>
                      router.push({
                        pathname: '/videoDetail',
                        params: { videoUrl: video.videoUrl },
                      })
                    }>
                    <Image
                      source={{
                        uri: video.coverUrl,
                      }}
                      className="aspect-[110/60] w-full rounded-lg"
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                      priority="normal"
                    />
                    <View className="absolute inset-0 items-center justify-center bg-black/20">
                      <View className="rounded-full bg-black/40 p-2">
                        <Ionicons name="play" size={20} color="white" />
                      </View>
                    </View>
                  </Pressable>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-[600]" numberOfLines={1}>
                      {video.title}
                    </Text>
                    <VideoDescription description={video.description} />
                  </View>
                </View>
              </View>
              </Pressable>
            ))
          )}
        </View>
      </Pressable>
    );
  }
);

type VideoCategoryProps = {
  activeSecondaryIndex: number;
  onSecondaryCategoryPress: (index: number) => void;
};

export default function VideoCategory({
  activeSecondaryIndex,
  onSecondaryCategoryPress,
}: VideoCategoryProps) {
  const secondaryCategories = ['成功学', '内在成长', '情绪处理', '团队管理', '道的部分'];
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data } = useCourseList({
    current: currentPage + 1,
    size: pageSize,
    type: secondaryCategories[activeSecondaryIndex],
  });
  console.log('data', data);
  const courses = data?.data.records || [];
  console.log('courses', courses);

  return (
    <>
      {/* 二级分类 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1 px-4">
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
      <ScrollView className="flex-1 px-4 pt-4">
        {courses?.map((course, index) => (
          <CourseItem
            key={index}
            title={course.title}
            description={course.description}
            coverUrl={course.coverUrl}
            courseId={course.id} // 新增 courseId 参数
          />
        )) || <Text className="text-center text-gray-500">暂无课程</Text>}
      </ScrollView>
    </>
  );
}
