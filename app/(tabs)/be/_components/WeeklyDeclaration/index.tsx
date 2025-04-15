import { View, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationList from './WeeklyDeclarationList';

const BOOK_ID = '1911671090439000066'; // TODO: 从路由或者props中获取

export default function WeeklyDeclaration() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeeklyDeclaration = async () => {
      try {
        setLoading(true);
        setError(null);

        // 检查是否有周宣告
        const currentResponse = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(BOOK_ID);
        console.log("currentResponse", currentResponse);

        if (currentResponse.code === 200) {
          // 存在周宣告，直接结束加载状态
          setLoading(false);
          return;
        }

        // 如果没有周宣告，创建一个新的
        const newDeclaration: Omit<WeeklyDeclarationDTO, 'id'> = {
          bookId: BOOK_ID,
          userId: '0', // 添加默认userId字段
          weekNumber: 1, // TODO: 计算当前是第几周
          title: '', // 可以根据需要设置默认标题
          declarationContent: '',
          weekStartDate: new Date().toISOString().split('T')[0], // 当前日期
          weekEndDate: new Date().toISOString().split('T')[0], // TODO: 计算周结束日期
          achievement: '',
          selfSummary: '',
          summary123456: '',
          nextStep: '',
          weekScore: '',
          weekExperience: '',
          whatWorked: '',
          whatDidntWork: '',
          whatLearned: '',
          whatNext: '',
          weeklyGoals: [],
          averageCompletionRate: 0,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        };

        // 由于接口需要id字段，这里强制类型转换（实际应用中应获取用户id）
        const createResponse = await weeklyDeclarationApi.createWeeklyDeclaration(newDeclaration as WeeklyDeclarationDTO);
        if (createResponse.code !== 200) {
          setError('创建周宣告失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取或创建周宣告失败');
      } finally {
        setLoading(false);
      }
    };

    initializeWeeklyDeclaration();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 pt-4">
      <WeeklyDeclarationList bookId={BOOK_ID} />
    </View>
  );
}
