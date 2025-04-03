import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

cssInterop(VideoView, { className: 'style' });
export default function CourseDetail() {
  const courseData = {
    title: '成功心态培养',
    teacher: '张导师',
    description: '通过系统化的学习，培养积极正向的成功心态，建立自信心和行动力。',
    rating: 4.8,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    content: '课程内容详情...',
    duration: '8课时',
    students: 1234,
  };

  const player = useVideoPlayer(courseData.video, (player) => {
    player.loop = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="relative">
        <VideoView
          player={player}
          className="h-full w-full"
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      <View className="p-4">
        <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {courseData.title}
        </Text>

        <View className="mb-4 flex-row items-center">
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">{courseData.teacher}</Text>
          <View className="ml-4 flex-row items-center">
            <Ionicons name="star" size={20} color="#facc15" />
            <Text className="ml-1 text-gray-600 dark:text-gray-400">
              {courseData.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="mb-6 flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="timer-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-600 dark:text-gray-400">{courseData.duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="home-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-600 dark:text-gray-400">
              {courseData.students}人学习
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-xl bg-white p-4 dark:bg-gray-800">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">课程简介</Text>
          <Text className="text-gray-600 dark:text-gray-400">{courseData.description}</Text>
        </View>

        <View className="rounded-xl bg-white p-4 dark:bg-gray-800">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">课程内容</Text>
          <Text className="text-gray-600 dark:text-gray-400">{courseData.content}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
