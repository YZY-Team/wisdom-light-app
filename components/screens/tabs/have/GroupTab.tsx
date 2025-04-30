import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import type { Dialog } from '~/types/have/dialogType';
import { useGroupDialogList } from '~/queries/dialog';

interface GroupTabProps {
  searchText: string;
}

export default function GroupTab({ searchText }: GroupTabProps) {
  const { data: groupDialogs, isLoading, error } = useGroupDialogList();

  // 根据搜索文本过滤群聊
  const filteredGroups = groupDialogs?.data?.filter((group: Dialog) => {
    const searchLower = searchText.toLowerCase();
    return group.title?.toLowerCase().includes(searchLower);
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">加载失败，请重试</Text>
      </View>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">暂无群聊</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={filteredGroups}
        renderItem={({ item }: { item: Dialog }) => (
          <Pressable
            className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3"
            onPress={() => {
              router.push({
                pathname: `/group-chat/${item.dialogId}`,
                params: { groupId: item.dialogId, groupName: item.title, groupAvatarUrl: item.avatarUrl },
              });
            }}>
            <Image
              source={
                item.avatarUrl
                  ? { uri: item.avatarUrl }
                  : require('~/assets/images/have/default-group-avatar.png')
              }
              className="h-12 w-12 rounded-full"
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium">{item.title}</Text>
              </View>
            </View>
          </Pressable>
        )}
        estimatedItemSize={72}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}