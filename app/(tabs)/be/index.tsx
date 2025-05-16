import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DailyDeclaration from '../../../components/screens/tabs/be/DailyDeclaration';
import WeeklyDeclaration from '../../../components/screens/tabs/be/WeeklyDeclaration';
import Achievements from '../../../components/screens/tabs/be/Achievements';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { useActiveAchievementBook } from '~/queries/achievement';
import { useUserStore } from '~/store/userStore';
import NoMemberTip from '~/components/screens/tabs/be/NoMemberTip';
import {
  useCurrentWeeklyDeclaration,
  useCreateWeeklyDeclaration,
  weeklyDeclarationKeys,
} from '~/queries/weeklyDeclaration';
import { useTodayDeclaration, useCreateDeclaration } from '~/queries/dailyDeclaration';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NewDailyDeclarationDTO, WeeklyDeclarationDTO } from '~/types/be/declarationType';
import { useFocusEffect } from 'expo-router';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';

cssInterop(LinearGradient, { className: 'style' });
type TabProps = {
  title: string;
  isActive?: boolean;
  href: string;
  onPress: () => void;
};

const Tab = ({ title, isActive, href, onPress }: TabProps) => (
  <Pressable
    className={`flex-1 items-center transition-all duration-200 ${!isActive && 'border-b-2 border-transparent hover:bg-gray-50'}`}
    onPress={onPress}>
    {isActive ? (
      <LinearGradient
        colors={['#1687FD', '#20A3FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full items-center rounded-[6px] py-3">
        <Text className="text-base font-medium text-white">{title}</Text>
      </LinearGradient>
    ) : (
      <View className="w-full items-center py-3">
        <Text className="text-base font-medium text-black/50">{title}</Text>
      </View>
    )}
  </Pressable>
);

export default function BeIndex() {
  const [activeTab, setActiveTab] = useState('daily');
  const { userInfo } = useUserStore();
  const {
    data: achievementBookResponse,
    isLoading: achievementBookLoading,
    refetch: refetchAchievementBook,
  } = useActiveAchievementBook();
  const achievementBookId = achievementBookResponse?.data?.id || '';
  const achievementBook = achievementBookResponse?.data;

  // 添加一个引用来跟踪是否正在创建日宣告
  const isCreatingDailyDeclaration = useRef(false);

  // 周宣告相关
  const {
    data: currentWeeklyDeclaration,
    isLoading: weeklyDeclarationLoading,
    refetch: refetchWeeklyDeclaration,
  } = useCurrentWeeklyDeclaration(achievementBookId);
  const createWeeklyDeclaration = useCreateWeeklyDeclaration();

  // 日宣告相关
  const {
    data: todayDeclarationRes,
    isLoading: todayDeclarationLoading,
    refetch: refetchTodayDeclaration,
  } = useTodayDeclaration(achievementBookId);
  const createDailyDeclaration = useCreateDeclaration();

  // 使用 useFocusEffect 来在组件挂载时刷新数据
  useFocusEffect(
    useCallback(() => {
      refetchAchievementBook();
      refetchWeeklyDeclaration();
      refetchTodayDeclaration();
    }, [])
  );

  // 创建周宣告的函数
  const handleCreateWeeklyDeclaration = async () => {
    if (!userInfo?.globalUserId || !achievementBookId) return null;

    const newWeeklyDeclaration: Omit<WeeklyDeclarationDTO, 'id'> = {
      bookId: achievementBookId,
      userId: userInfo.globalUserId,
      weekNumber: 1, // TODO: 计算当前是第几周
      title: '',
      declarationContent: '',
      weekStartDate: (() => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0是周日，1是周一，以此类推
        const diff = now.getDate() - dayOfWeek;
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(diff);
        // 调整为北京时间
        const utcDate = new Date(firstDayOfWeek.getTime() + 8 * 60 * 60 * 1000);
        return utcDate.toISOString().split('T')[0];
      })(),
      weekEndDate: (() => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(diff);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        // 调整为北京时间
        const utcDate = new Date(lastDayOfWeek.getTime() + 8 * 60 * 60 * 1000);
        return utcDate.toISOString().split('T')[0];
      })(),
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
      createTime: (() => {
        const date = new Date();
        // 获取ISO字符串并调整为北京时间
        const utcDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return utcDate.toISOString();
      })(),
      updateTime: (() => {
        const date = new Date();
        // 获取ISO字符串并调整为北京时间
        const utcDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return utcDate.toISOString();
      })(),
    };

    try {
      const result = await createWeeklyDeclaration.mutateAsync(
        newWeeklyDeclaration as WeeklyDeclarationDTO
      );
      return result;
    } catch (error) {
      console.log('创建周宣告失败:', error);
      return null;
    }
  };

  // 创建日宣告的函数
  const handleCreateDailyDeclaration = async (weeklyDeclarationId: string) => {
    console.log('create daily declaration', achievementBookId);
    if (!userInfo?.globalUserId || !achievementBookId) return;

    const newDeclaration: NewDailyDeclarationDTO = {
      userId: userInfo.globalUserId,
      bookId: achievementBookId,
      weeklyDeclarationId: weeklyDeclarationId,
      dayNumber: 1, // TODO: 根据实际情况计算
      declarationDate: (() => {
        const date = new Date();
        // 获取ISO字符串并调整为北京时间
        const utcDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return utcDate.toISOString().split('.')[0];
      })(),
      morningPlan: '',
      noonPlan: '',
      afternoonPlan: '',
      eveningPlan: '',
      dayScore: '',
      dayExperience: '',
      whatWorked: '',
      whatDidntWork: '',
      whatLearned: '',
      whatNext: '',
      dailyGoals: [],
    };

    try {
      const result = await createDailyDeclaration.mutateAsync(newDeclaration);
      console.log('创建日宣告', result);
      return result;
    } catch (error) {
      console.log('创建今日宣告失败:', error);
    }
  };

  // 初始化宣告数据
  useEffect(() => {
    const initializeDeclarations = async () => {
      // 如果没有成就书ID或用户不是会员，则不执行
      if (!achievementBookId || !userInfo?.isMember || !userInfo?.globalUserId) return;

      // 检查并创建周宣告和日宣告
      if (!weeklyDeclarationLoading && !currentWeeklyDeclaration) {
        // 创建周宣告
        const weeklyDeclaration = await handleCreateWeeklyDeclaration();
        const weeklyDeclarationId = weeklyDeclaration?.id;

        // 如果周宣告创建成功且没有今日宣告，则创建日宣告
        if (
          weeklyDeclarationId &&
          !todayDeclarationLoading &&
          todayDeclarationRes?.code === 404 &&
          !isCreatingDailyDeclaration.current
        ) {
          isCreatingDailyDeclaration.current = true;
          try {
            await handleCreateDailyDeclaration(weeklyDeclarationId);
          } finally {
            isCreatingDailyDeclaration.current = false;
          }
        }
      } else if (
        currentWeeklyDeclaration &&
        !todayDeclarationLoading &&
        todayDeclarationRes?.code === 404 &&
        !isCreatingDailyDeclaration.current
      ) {
        // 如果已有周宣告但没有今日宣告，则创建日宣告
        console.log('创建日宣告');
        isCreatingDailyDeclaration.current = true;
        try {
          await handleCreateDailyDeclaration(currentWeeklyDeclaration.id);
        } finally {
          isCreatingDailyDeclaration.current = false;
        }
      }
    };

    initializeDeclarations();
  }, [
    achievementBookId,
    userInfo?.isMember,
    userInfo?.globalUserId,
    weeklyDeclarationLoading,
    currentWeeklyDeclaration,
    todayDeclarationLoading,
    todayDeclarationRes?.code,
  ]);

  // 判断用户是否是会员
  if (!userInfo?.isMember) {
    return (
      <View className="flex-1 bg-[#F5F8FC] px-4 pt-3">
        {/* 导航栏 */}
        <View className="flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
          <Tab
            title="日宣告"
            isActive={activeTab === 'daily'}
            href=""
            onPress={() => setActiveTab('daily')}
          />
          <Tab
            title="周宣告"
            isActive={activeTab === 'weekly'}
            href=""
            onPress={() => setActiveTab('weekly')}
          />
          <Tab
            title="成就书"
            isActive={activeTab === 'achievements'}
            href=""
            onPress={() => setActiveTab('achievements')}
          />
        </View>
        <NoMemberTip
          tipText={
            activeTab === 'daily'
              ? '充值会员之后才能拥有日宣告哦～'
              : activeTab === 'weekly'
                ? '充值会员之后才能拥有周宣告哦～'
                : '充值会员之后才能拥有成就书哦～'
          }
        />
      </View>
    );
  }

  // 加载中状态
  if (achievementBookLoading) {
    return (
      <View className="flex-1 bg-[#F5F8FC] px-4 pt-3">
        {/* 导航栏 */}
        <View className="flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
          <Tab
            title="日宣告"
            isActive={activeTab === 'daily'}
            href=""
            onPress={() => setActiveTab('daily')}
          />
          <Tab
            title="周宣告"
            isActive={activeTab === 'weekly'}
            href=""
            onPress={() => setActiveTab('weekly')}
          />
          <Tab
            title="成就书"
            isActive={activeTab === 'achievements'}
            href=""
            onPress={() => setActiveTab('achievements')}
          />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyDeclaration bookId={achievementBookId} userInfo={userInfo} />;
      case 'weekly':
        return <WeeklyDeclaration bookId={achievementBookId} userInfo={userInfo} />;
      case 'achievements':
        return <Achievements achievementBook={achievementBook} userInfo={userInfo} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-[#F5F8FC] px-4 pt-3">
        {/* 导航栏 */}
        <View className="flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
          <Tab
            title="日宣告"
            isActive={activeTab === 'daily'}
            href=""
            onPress={() => setActiveTab('daily')}
          />
          <Tab
            title="周宣告"
            isActive={activeTab === 'weekly'}
            href=""
            onPress={() => setActiveTab('weekly')}
          />
          <Tab
            title="成就书"
            isActive={activeTab === 'achievements'}
            href=""
            onPress={() => setActiveTab('achievements')}
          />
        </View>

        {renderContent()}
      </View>
    
  );
}
