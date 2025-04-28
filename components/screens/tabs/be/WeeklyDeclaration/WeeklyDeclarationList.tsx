import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationItem from './WeeklyDeclarationItem';
import { useWeeklyDeclarationList, useCurrentWeeklyDeclaration } from '~/queries/weeklyDeclaration';
import { useQueryClient } from '@tanstack/react-query';

interface WeeklyDeclarationListProps {
  bookId: string;
}

export default function WeeklyDeclarationList({ bookId }: WeeklyDeclarationListProps) {
  const { data: declarations = [], isLoading, error } = useWeeklyDeclarationList(bookId);
  const { data: currentDeclaration } = useCurrentWeeklyDeclaration(bookId);
  const queryClient = useQueryClient();

  // 判断宣告是否是当前周的宣告
  const isCurrentDeclaration = (declaration: WeeklyDeclarationDTO) => {
    return currentDeclaration && currentDeclaration.id === declaration.id;
  };

  // 处理更新宣告
  const handleUpdateDeclaration = (updatedDeclaration: WeeklyDeclarationDTO) => {
    // 更新本地缓存中的数据
    queryClient.setQueryData(
      ['weeklyDeclarations', bookId],
      (oldData: WeeklyDeclarationDTO[] | undefined) => {
        if (!oldData) return [updatedDeclaration];
        return oldData.map(declaration =>
          declaration.id === updatedDeclaration.id ? updatedDeclaration : declaration
        );
      }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text>加载周宣告列表中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text className="text-red-500">{error.message}</Text>
      </View>
    );
  }

  if (declarations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text>暂无周宣告</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={declarations}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        estimatedItemSize={200}
        renderItem={({ item }) => (
          <View 
            className="mb-6"
            style={{ 
              opacity: isCurrentDeclaration(item) ? 1 : 0.5 
            }}
          >
            <WeeklyDeclarationItem 
              declaration={item}
              onUpdateDeclaration={handleUpdateDeclaration}
              readOnly={!isCurrentDeclaration(item)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}