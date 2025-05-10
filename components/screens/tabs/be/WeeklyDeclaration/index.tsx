import { View, Text, ScrollView, Pressable } from 'react-native';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationList from './WeeklyDeclarationList';
import {
  useCurrentWeeklyDeclaration,
  useCreateWeeklyDeclaration,
  weeklyDeclarationKeys,
  useUpdateWeeklyDeclaration,
  useWeeklyDeclarationList
} from '~/queries/weeklyDeclaration';
import { Image } from 'react-native';
import saveIcon from '~/assets/saveIcon.png';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import NoMemberTip from '../NoMemberTip';
import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { UserInfo } from '~/store/userStore';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

cssInterop(Image, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 自定义 hook 处理周宣告创建逻辑
function useWeeklyDeclarationCreation(bookId: string, userId: string) {
  // 只有当有有效的 achievementBookId 时才执行查询
  const { data: currentDeclaration, isLoading, error } = useQuery({
    queryKey: bookId ? weeklyDeclarationKeys.current(bookId) : ['weeklyDeclaration', 'current', 'none'],
    queryFn: async () => {
      if (!bookId) return null;
      const response = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(bookId);
      if (response.code === 200) {
        return response.data;
      }
      return null;
    },
    enabled: !!bookId, // 只有当 bookId 存在时才启用查询
  });
  
  const createMutation = useCreateWeeklyDeclaration();
  const [hasTriedCreating, setHasTriedCreating] = useState(false);

  useEffect(() => {
    // 只有当以下条件全部满足时才创建新的周宣告：
    // 1. 有有效的成就书 ID
    // 2. 有有效的用户 ID
    // 3. 没有正在加载中
    // 4. 当前没有周宣告数据
    // 5. 没有正在进行的创建操作
    // 6. 之前没有尝试过创建
    if (bookId && userId && !isLoading && !currentDeclaration && !createMutation.isPending && !hasTriedCreating) {
      const newDeclaration: Omit<WeeklyDeclarationDTO, 'id'> = {
        bookId: bookId,
        userId: userId, // 使用用户的 globalUserId
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
        updateTime: new Date().toISOString(),
      };

      createMutation.mutate(newDeclaration as WeeklyDeclarationDTO);
      setHasTriedCreating(true);
    }
  }, [isLoading, currentDeclaration, createMutation.isPending, hasTriedCreating, bookId, userId]);

  return {
    currentDeclaration,
    isLoading,
    error,
    isPending: createMutation.isPending,
    createError: createMutation.error
  };
}

// WeeklyDeclaration 组件属性定义
type WeeklyDeclarationProps = {
  bookId: string;
  userInfo: UserInfo;
};

export default function WeeklyDeclaration({ bookId, userInfo }: WeeklyDeclarationProps) {
  const { 
    currentDeclaration, 
    isLoading, 
    error, 
    isPending, 
    createError,
  } = useWeeklyDeclarationCreation(bookId, userInfo?.globalUserId || '');
  

  
  if (!userInfo?.isMember) {
    return (
      <NoMemberTip
        tipText="充值会员之后才能拥有周宣告哦～"
      />
    );
  }

 

  if (isLoading || isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (error || createError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">
          {error?.message || createError?.message || '获取或创建周宣告失败'}
        </Text>
      </View>
    );
  }

  if (!bookId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>未找到活跃的成就书</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={50} className="flex-1"  behavior={'padding'} style={{ flex: 1 }}>
      {/* <View className="absolute right-4 top-10 z-[1000]">
        <Pressable onPress={handleSave} disabled={isSaving}>
          <BlurView
            className="h-12 w-12 flex-col items-center justify-center rounded-full bg-[#1483FD0D]"
            experimentalBlurMethod="dimezisBlurView"
            intensity={10}>
            <Image source={saveIcon} className="h-5 w-5" />
            <Text className="text-[12px] font-[600] text-[#1483FD]">
              {isSaving ? '保存中' : '保存'}
            </Text>
          </BlurView>
        </Pressable>
      </View> */}
      {bookId ? (
        <WeeklyDeclarationList bookId={bookId} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>未找到活跃的成就书</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
