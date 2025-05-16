// 导入必要的React Native组件和钩子
import { View, Text, TextInput, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, useMemo } from 'react';
import MorningDeclaration from './MorningDeclaration';
import EveningDeclaration from './EveningDeclaration';
import DailyResult from './DailyResult';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTodayDeclaration, useBookDeclarations } from '~/queries/dailyDeclaration';
import NoMemberTip from '../NoMemberTip';
import { UserInfo } from '~/store/userStore';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// 启用nativewind的CSS类名支持
cssInterop(Text, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 定义晚总结报告项的类型接口
type EveningReportItem = {
  label: string; // 报告项标签
  value: string; // 报告项值
};

// 定义每日数据的类型接口
type DailyData = {
  id: string; // 添加id字段
  date: Date; // 日期
  timeSlots: TimeSlotSection[]; // 时间段数据
  eveningContent: string; // 晚间内容
  eveningStatus: 'completed' | 'pending'; // 晚间状态
  eveningReport: EveningReportItem[]; // 晚间报告
  dailyResult: {
    goals: Array<{
      content?: string; // 目标内容
      title?: string; // 目标标题
      completedQuantity?: number; // 完成数量
      unit?: string; // 单位
    }>;
    weeklyProgress: string; // 周进度
    monthlyProgress: string; // 月进度
  };
};

// 单日宣告项组件：展示单天的所有宣告内容
const DailyDeclarationItem = ({ item, onRefresh }: { item: DailyData; onRefresh: () => void }) => {
  // 计算星期几和第几周
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][item.date.getDay()];
  const week = Math.ceil((item.date.getDate() - item.date.getDay()) / 7);

  // 添加展开/收起状态
  const [expanded, setExpanded] = useState(true);

  // 切换展开/收起状态的函数
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 判断是否为今天的宣告
  const isToday = () => {
    const now = new Date();
    const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const utc8Today = utc8Date.toISOString().split('T')[0];
    const itemDate = new Date(item.date.getTime() + 8 * 60 * 60 * 1000);
    const itemDateStr = itemDate.toISOString().split('T')[0];
    return utc8Today === itemDateStr;
  };

  return (
    <View className="" style={{ opacity: isToday() ? 1 : 0.5 }}>
      {/* 日期头部 */}
      <View className="flex-row items-center justify-center  px-4 py-4">
        <View className="mt-1 flex-row items-end">
          <View className="flex-row items-center">
            <Text className="text-[20px] font-bold text-gray-500">{`第`}</Text>
            <Text className="text-[20px] font-bold text-[#F18318]">{week}</Text>
            <Text className="text-[20px] font-bold text-gray-500">{`天`}</Text>
          </View>
          <View className="ml-1 flex-row items-center">
            <Text className="text-base font-bold text-gray-500">{`第`}</Text>
            <Text className="text-base font-bold text-[#1483FD]">{week}</Text>
            <Text className="text-base font-bold text-gray-500">{`周`}</Text>
          </View>
          <View className="ml-1 flex-row items-center">
            <Text className="text-base font-bold text-gray-500">{`星期`}</Text>
            <Text className="text-base font-bold text-[#1483FD]">{weekday}</Text>
          </View>
        </View>
      </View>

      {/* 早宣告模块 - 收起时只显示标题栏 */}
      <View className={`${expanded ? 'mb-4' : ''} overflow-hidden rounded-xl bg-white`}>
        {/* 头部渐变标题栏 */}
        <Pressable
          onPress={toggleExpand}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex h-[38px] flex-row items-center justify-between rounded-t-xl px-4"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Text
              className="text-white"
              style={{
                fontSize: 16,
                fontWeight: '800',
                lineHeight: 20,
              }}>
              早宣告
            </Text>
            <Text className="text-[16px] text-white">{`${item.date.getFullYear()}年${item.date.getMonth() + 1}月${item.date.getDate()}日`}</Text>
            {/* 添加展开/收起图标 */}
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* 条件渲染早宣告内容 */}
        {expanded && (
          <MorningDeclaration
            date={item.date}
            timeSlots={item.timeSlots}
            showHeader={false}
            declarationId={item.id}
            onUpdate={onRefresh}
            readOnly={!isToday()}
          />
        )}
      </View>

      {/* 只在展开状态下显示晚总结 */}
      {expanded && (
        <View className="mb-4 overflow-hidden rounded-xl bg-white">
          {/* 头部渐变标题栏 */}
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex h-[38px] flex-row items-center justify-between rounded-t-xl px-4"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Text
              className="text-white"
              style={{
                fontSize: 16,
                fontWeight: '800',
                lineHeight: 20,
              }}>
              晚总结
            </Text>
          </LinearGradient>
          <EveningDeclaration
            date={item.date}
            eveningReport={item.eveningReport}
            showHeader={false}
            declarationId={item.id}
            onUpdate={onRefresh}
            readOnly={!isToday()}
          />
        </View>
      )}

      {/* 今日成果模块 */}
      {expanded ? (
        /* 展开状态 - 显示完整的今日成果组件 */
        <DailyResult
          goals={item.dailyResult.goals}
          showHeader={true}
          declarationId={item.id}
          onUpdate={onRefresh}
          readOnly={!isToday()}
        />
      ) : (
        /* 收起状态 - 仅显示目标列表内容，不带标题 */
        <DailyResult
          goals={item.dailyResult.goals}
          showHeader={false}
          declarationId={item.id}
          onUpdate={onRefresh}
          readOnly={!isToday()}
        />
      )}
    </View>
  );
};

// DailyDeclaration 组件属性定义
type DailyDeclarationProps = {
  bookId: string;
  userInfo: UserInfo;
};

// 主组件：每日宣告列表
export default function DailyDeclaration({ bookId, userInfo }: DailyDeclarationProps) {
  if (!userInfo?.isMember) {
    return <NoMemberTip tipText="充值会员之后才能拥有日宣告哦～" />;
  }

  // 获取历史宣告列表
  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useBookDeclarations(bookId);

  // 刷新数据的回调函数
  const fetchDeclarations = useCallback(() => {
    if (bookId) {
      refetchHistory();
    }
  }, [refetchHistory, bookId]);

  // 处理历史宣告数据
  const historicalDailyData = useMemo(() => {
    if (!historyResponse?.data) return [];
    return historyResponse.data.map((declaration) => ({
      id: declaration.id,
      date: new Date(declaration.declarationDate),
      timeSlots: [
        {
          title: '上午',
          items: [{ content: declaration.morningPlan || '', time: '7:00' }],
        },
        {
          title: '中午',
          items: [{ content: declaration.noonPlan || '', time: '12:00' }],
        },
        {
          title: '下午',
          items: [{ content: declaration.afternoonPlan || '', time: '14:00' }],
        },
        {
          title: '晚上',
          items: [{ content: declaration.eveningPlan || '', time: '19:00' }],
        },
      ],
      eveningContent: '',
      eveningStatus: 'completed' as const,
      eveningReport: [
        { label: '打分', value: declaration.dayScore || '' },
        { label: '体验', value: declaration.dayExperience || '' },
        { label: '行得通', value: declaration.whatWorked || '' },
        { label: '行不通', value: declaration.whatDidntWork || '' },
        { label: '学习到', value: declaration.whatLearned || '' },
        { label: '下一步', value: declaration.whatNext || '' },
      ],
      dailyResult: {
        goals:
          declaration.dailyGoals?.map((goal) => ({
            goalId: goal.goalId,
            title: goal.title,
            completedQuantity: goal.completedQuantity,
            unit: goal.unit,
            weeklyProgress: `${goal.weeklyCompletedQuantity || 0}/${goal.weeklyTargetQuantity || 0}`,
            totalProgress: `${goal.totalCompletedQuantity || 0}/${goal.totalTargetQuantity || 0}`,
          })) || [],
        weeklyProgress: '0/0',
        monthlyProgress: '0/0',
      },
    }));
  }, [historyResponse?.data]);

  if (!bookId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">未找到活跃的成就书</Text>
      </View>
    );
  }

  return isHistoryLoading ? (
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-500">加载中...</Text>
    </View>
  ) : (
    <FlashList
      data={historicalDailyData}
      renderItem={({ item }) => <DailyDeclarationItem item={item} onRefresh={fetchDeclarations} />}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={200}
      contentContainerStyle={{
        paddingBottom: 160,
      }}
    />
  );
}

// 定义时间段项的类型接口
type TimeSlotItem = {
  content: string; // 内容
  time: string; // 时间点
};

// 定义时间段区块的类型接口
type TimeSlotSection = {
  title: string; // 区块标题
  items: TimeSlotItem[]; // 时间段项列表
};
