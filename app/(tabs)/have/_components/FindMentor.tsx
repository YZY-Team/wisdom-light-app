import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export default function FindMentor() {
  return (
    <ScrollView className="px-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-semibold text-gray-900">全部导师</Text>
        <Ionicons name="chevron-down-outline" size={20} color="#666" />
      </View>
      <View className="mb-3 rounded-xl bg-white p-4 dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty' }}
              className="h-12 w-12 rounded-full"
            />
            <View className="ml-3">
              <View className="flex-row items-center">
                <Text className="mr-2 text-base font-semibold text-gray-900 dark:text-white">
                  张导师
                </Text>
                <Text className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-500">
                  资深导师
                </Text>
              </View>
              <Text className="mt-1 text-sm text-gray-500">支持领域：成功学、团队管理</Text>
            </View>
          </View>
          <Pressable className="rounded-full bg-blue-500 px-4 py-1">
            <Text className="text-white">咨询</Text>
          </Pressable>
        </View>
        <View className="mt-2 flex-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={16} color="#facc15" />
          ))}
          <Text className="ml-1 text-sm text-gray-500">4.9</Text>
        </View>
      </View>
    </ScrollView>
  );
}