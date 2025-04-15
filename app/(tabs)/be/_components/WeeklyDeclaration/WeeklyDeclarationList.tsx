import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationItem from './WeeklyDeclarationItem';

interface WeeklyDeclarationListProps {
  bookId: string;
}

export default function WeeklyDeclarationList({ bookId }: WeeklyDeclarationListProps) {
  const [declarations, setDeclarations] = useState<WeeklyDeclarationDTO[]>([]);
  const [currentDeclaration, setCurrentDeclaration] = useState<WeeklyDeclarationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 同时发起两个请求
        const [listResponse, currentResponse] = await Promise.all([
          weeklyDeclarationApi.getWeeklyDeclarationList(bookId),
          weeklyDeclarationApi.getCurrentWeeklyDeclaration(bookId)
        ]);
        
        if (listResponse.code === 200) {
          setDeclarations(listResponse.data.reverse());
        } else {
          setError('获取周宣告列表失败');
        }
        
        if (currentResponse.code === 200) {
          setCurrentDeclaration(currentResponse.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取周宣告数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const handleUpdateDeclaration = (updatedDeclaration: WeeklyDeclarationDTO) => {
    // 更新declarations数组中的对应宣告
    setDeclarations(prev => 
      prev.map(item => 
        item.id === updatedDeclaration.id ? updatedDeclaration : item
      )
    );
    
    // 如果更新的是当前周宣告，也要更新currentDeclaration
    if (currentDeclaration && currentDeclaration.id === updatedDeclaration.id) {
      setCurrentDeclaration(updatedDeclaration);
    }
  };

  // 判断宣告是否是当前周的宣告
  const isCurrentDeclaration = (declaration: WeeklyDeclarationDTO) => {
    return currentDeclaration && currentDeclaration.id === declaration.id;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text>加载周宣告列表中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text className="text-red-500">{error}</Text>
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
      <FlatList
        data={declarations}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
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