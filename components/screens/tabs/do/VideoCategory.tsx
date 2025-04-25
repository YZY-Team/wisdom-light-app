import { ScrollView, View, Text, Pressable } from 'react-native';
import SecondaryCategory from './SecondaryCategory';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import vip from '~/assets/vip.png';
import { BlurView } from 'expo-blur';
import { memo, useState, useEffect } from 'react';
import { useCourseList, useCourseVideos } from '~/queries/course';
import { useRouter } from 'expo-router';
cssInterop(Image, { className: 'style' });

const CourseItem = memo(
  ({
    title,
    description,
    episodeCount,
    courseId, // 新增 courseId 参数
  }: {
    title: string;
    description: string;
    episodeCount: number;
    courseId: string; // 新增 courseId 类型
  }) => {
    const [expanded, setExpanded] = useState(false);
    const { data: videos, isLoading } = useCourseVideos(courseId); // 使用新的查询钩子
    const router = useRouter(); // 引入 useRouter
    const videoList = videos?.data ?? [];
    console.log('videos', videos);

    // 预加载图片（可选，参考前文方案 3）
    useEffect(() => {
      Image.prefetch(['https://images.unsplash.com/photo-1522202176988-66273c2fd55f']);
    }, []);

    return (
      <Pressable
        className="mb-4 overflow-hidden rounded-lg bg-white "
        onPress={() => setExpanded(!expanded)}>
        {/* 主内容 */}
        <View className="flex-row items-center p-2">
          <View className="relative w-[40%]">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
              }}
              className="aspect-[156/84] w-full rounded-lg"
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              priority="high"
            />
            <View className="absolute left-0 top-0 h-full w-full flex-col justify-between py-2">
              <View className="flex w-full items-end justify-center rounded pr-2">
                <Image
                  source={vip}
                  className="rounded-1 h-[18px] w-[36px]"
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
              <View className="h-5 w-full items-center justify-center rounded">
                <Text className="text-[12px] font-[700] text-white">{title}</Text>
              </View>
              <View className="ml-1 items-end justify-center rounded px-1">
                <BlurView
                  experimentalBlurMethod="dimezisBlurView"
                  intensity={10}
                  tint="dark"
                  className="flex items-center justify-center overflow-hidden rounded bg-[#0000004D]">
                  <Text className="px-2 py-1 text-[10px] text-white">共{episodeCount}集</Text>
                </BlurView>
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
              <Pressable
                key={index}
                className="mb-2 flex-row items-center rounded-lg px-1"
                onPress={() =>
                  router.push({
                    pathname: '/videoDetail',
                    params: { videoUrl: video.videoUrl },
                  })
                }>
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-[#00000066]">{index + 1}</Text>
                  </View>
                  <View className="relative ml-2 w-[30%]">
                    <Image
                      source={{
                        uri:
                          video.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                      }}
                      className="aspect-[110/60] w-full rounded-lg"
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                      priority="normal"
                    />
                    <View className="absolute left-0 top-0 flex h-full w-full items-center justify-center px-1">
                      <View className="max-w-[80%]">
                        <Text
                          className="truncate bg-white p-1 text-[1.6vw] font-[700] text-[#1483FD]"
                          numberOfLines={1}>
                          {video.title}
                        </Text>
                      </View>
                    </View>
                    <View className="absolute bottom-1 right-1">
                      <BlurView
                        experimentalBlurMethod="dimezisBlurView"
                        intensity={10}
                        tint="dark"
                        className="flex items-center justify-center overflow-hidden rounded bg-[#0000004D]">
                        <Text className="px-2 py-1 text-[10px] text-white">{video.duration}</Text>
                      </BlurView>
                    </View>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-[600]" numberOfLines={1}>
                      {index + 1}.{video.title}
                    </Text>
                    <Text className="mt-1 text-xs text-[#00000066]" numberOfLines={2}>
                      {video.description}
                    </Text>
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
  const courses = data?.data.records || [];
  console.log('courses', courses);

  const courseData: {
    [key: string]: {
      title: string;
      description: string;
      episodeCount: number;
    }[];
  } = {
    成功学: [
      {
        title: '普通人逆袭的5大底层逻辑',
        description: '学习如何培养成功者思维方式，建立正确的成功观念。',
        episodeCount: 21,
      },
      {
        title: '从思维破局到行动觉醒',
        description:
          '学习如何培养成功者思维方式，建立正确的成功观念。学习如何培养成功者思维方式，建立正确的成功观念观念观念。',
        episodeCount: 21,
      },
      {
        title: '赢家思维',
        description: '学习如何培养成功者思维方式，建立正确的成功观念。',
        episodeCount: 21,
      },
      {
        title: '从自卑到自信',
        description: '学习如何培养成功者思维方式，建立正确的成功观念。',
        episodeCount: 21,
      },
    ],
    // ... 其他分类数据保持不变
  };

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
            episodeCount={course.episodeCount}
            courseId={course.id} // 新增 courseId 参数
          />
        )) || <Text className="text-center text-gray-500">暂无课程</Text>}
      </ScrollView>
    </>
  );
}
