import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import cardImage from '~/assets/splash.png';

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
  image: string;
};

export default function CourseCard({ title, teacher, description, rating, image }: CourseCardProps) {
  return (
    <Pressable className="mb-2 flex-row justify-between overflow-hidden rounded-xl border border-black/5 bg-white dark:bg-gray-800">
      <View className="w-[65%] p-4">
        <View className="mb-3 flex flex-row items-start">
          <Image
            source={{ uri: cardImage }}
            className="h-12 w-12 rounded-full bg-black"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-900">{teacher}</Text>
              <Text className="ml-2 rounded-md bg-[#FFF5E5] px-2 py-0.5 text-sm text-[#FF9500]">
                首席导师
              </Text>
            </View>
            <View className="mt-1 flex-col ">
              <Text className="text-sm text-gray-500">番号：12345464</Text>
              <Text className="text-sm text-gray-500">毕业平台：XXXXXX</Text>
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
      <View className="flex w-[30%] items-center justify-center overflow-hidden">
        <Image
          source={{ uri: image }}
          className="aspect-[100/136] w-[90%] rounded-[6px]"
          contentFit="cover"
          onLoad={() => console.log('Image loaded successfully')}
          onError={(error) => console.log('Image loading error:', error)}
        />
      </View>
    </Pressable>
  );
}