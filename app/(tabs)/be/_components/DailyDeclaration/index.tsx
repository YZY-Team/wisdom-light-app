// 导入必要的React Native组件和钩子
import { View, Text, FlatList, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import MorningDeclaration from './MorningDeclaration';
import EveningDeclaration from './EveningDeclaration';
import DailyResult from './DailyResult';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { dailyDeclarationApi } from '~/api/be/dailyDeclaration';
import { NewDailyDeclarationDTO } from '~/types/be/declarationType';

// 启用nativewind的CSS类名支持
cssInterop(Text, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 定义宣告卡片的属性类型接口
type DeclarationCardProps = {
  title: string; // 卡片标题
  time: string; // 时间
  status: 'completed' | 'pending'; // 完成状态
  content?: string; // 可选的内容
  onSubmit?: (content: string) => void; // 提交回调
  inputValue?: string; // 输入值
  onInputChange?: (value: string) => void; // 输入变化回调
};

// 定义晚总结报告项的类型接口
type EveningReportItem = {
  label: string; // 报告项标签
  value: string; // 报告项值
};

// 宣告卡片组件（当前为空实现）
const DeclarationCard = ({
  title,
  time,
  status,
  content,
  onSubmit,
  inputValue,
  onInputChange,
}: DeclarationCardProps) => <View className="mb-4 overflow-hidden rounded-xl bg-white"></View>;

// 定义时间段的类型接口
type TimeSlot = {
  content: string; // 内容
  time: string; // 时间
};

// 获取时间段对应的颜色
const getBarColor = (title: string) => {
  switch (title) {
    case '上午':
      return '#7AE1C3';
    case '中午':
      return '#FBA720';
    case '下午':
      return '#1587FD';
    case '晚上':
      return '#440063';
    default:
      return '#1483FD';
  }
};

// 定义每日数据的类型接口
type DailyData = {
  date: Date; // 日期
  timeSlots: TimeSlotSection[]; // 时间段数据
  eveningContent: string; // 晚间内容
  eveningStatus: 'completed' | 'pending'; // 晚间状态
  eveningReport: EveningReportItem[]; // 晚间报告
  dailyResult: {
    goals: Array<{
      content: string; // 目标内容
      unit?: string; // 单位
    }>;
    weeklyProgress: string; // 周进度
    monthlyProgress: string; // 月进度
  };
};

// 单日宣告项组件：展示单天的所有宣告内容
const DailyDeclarationItem = ({ item }: { item: DailyData }) => {
  // 计算星期几和第几周
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][item.date.getDay()];
  const week = Math.ceil((item.date.getDate() - item.date.getDay()) / 7);

  // 添加展开/收起状态
  const [expanded, setExpanded] = useState(false);

  // 切换展开/收起状态的函数
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <View className="">
      {/* 日期头部 */}
      <View className="items-center py-4 flex-row  justify-center px-4">
        <View className="mt-1 flex-row items-end">
          <View className="flex-row items-center">
            <Text className="text-[20px] text-gray-500 font-bold">{`第`}</Text>
            <Text className="text-[20px] text-[#F18318] font-bold">{week}</Text>
            <Text className="text-[20px] text-gray-500 font-bold">{`天`}</Text>
          </View>
          <View className="flex-row items-center ml-1">
            <Text className="text-base text-gray-500 font-bold">{`第`}</Text>
            <Text className="text-base text-[#1483FD] font-bold">{week}</Text>
            <Text className="text-base text-gray-500 font-bold">{`周`}</Text>
          </View>
          <View className="flex-row items-center ml-1">
            <Text className="text-base text-gray-500 font-bold">{`星期`}</Text>
            <Text className="text-base text-[#1483FD] font-bold">{weekday}</Text>
          </View>
        </View>


      </View>


      {/* 早宣告模块 - 收起时只显示标题栏 */}
      <View className={`${expanded ? "mb-4" : ""} overflow-hidden rounded-xl bg-white`}>
        {/* 头部渐变标题栏 */}
        <Pressable
          onPress={toggleExpand}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [
            { opacity: pressed ? 0.9 : 1 }
          ]}>
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
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>


        {/* 条件渲染早宣告内容 */}
        {expanded && (
          <MorningDeclaration date={item.date} timeSlots={item.timeSlots} showHeader={false} />
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
          <EveningDeclaration date={item.date} eveningReport={item.eveningReport} showHeader={false} />
        </View>
      )}

      {/* 今日成果模块 */}
      {expanded ? (
        /* 展开状态 - 显示完整的今日成果组件 */
        <View className="mb-4 overflow-hidden rounded-xl bg-white">
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex h-[38px] flex-col items-start justify-center rounded-t-xl px-4"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Text
              className="text-white"
              style={{
                fontFamily: 'Roboto',
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 20,
              }}>
              今日成果
            </Text>
          </LinearGradient>

          <DailyResult
            goals={item.dailyResult.goals}
            weeklyProgress={item.dailyResult.weeklyProgress}
            monthlyProgress={item.dailyResult.monthlyProgress}
            showHeader={false}
            showGoalsOnly={false}
          />
        </View>
      ) : (
        /* 收起状态 - 仅显示目标列表内容，不带标题 */
        <View className="p-4 bg-white rounded-b-xl">
          {/* 目标列表 */}
          <View>
            {item.dailyResult.goals.map((goal, index) => (
              <View key={index} className="relative mb-4 overflow-hidden rounded-[6px]">
                <View className="flex-col">
                  <Text className="ml-1 text-[14px] font-medium text-gray-700">
                    目标{index + 1}：
                  </Text>
                  <View className="flex-row items-center">
                    <BlurView intensity={10} className="absolute h-full w-full bg-[#1483FD0D]" />
                    <TextInput
                      className="z-10 min-h-[47px] flex-1 p-3 text-gray-600"
                      placeholder={`请输入目标${index + 1}...`}
                      multiline
                      value={goal.content}
                      editable={false}
                    />
                    {goal.unit && <Text className="mr-3 text-gray-500">{goal.unit}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// 主组件：每日宣告列表
export default function DailyDeclaration() {
  // 剩余时间状态
  const [remainingTime, setRemainingTime] = useState('');
  // 今日宣告数据状态
  const [todayDeclaration, setTodayDeclaration] = useState<NewDailyDeclarationDTO | null>(null);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 历史日宣告列表
  const [historicalDeclarations, setHistoricalDeclarations] = useState<NewDailyDeclarationDTO[]>([]);

  // 获取今日宣告和历史宣告
  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        setIsLoading(true);

        // 获取成就书的所有日宣告
        const bookId = "1911671090439000066"; // 这里需要从上下文获取实际的bookId


        // 先获取今日宣告
        const todayResponse = await dailyDeclarationApi.getTodayDailyDeclaration(bookId);

        if (todayResponse.code === 404) {
          const newDeclaration: NewDailyDeclarationDTO = {
            bookId: bookId,
            weeklyDeclarationId: 1, // 这里需要从上下文获取
            dayNumber: 1, // 这里需要根据实际情况计算
            declarationDate: new Date().toISOString().split('T')[0],
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
            dailyGoals: []
          };

          try {
            const createResponse = await dailyDeclarationApi.createNewDailyDeclaration(newDeclaration);
            if (createResponse.data) {
              // 创建成功后重新获取今日宣告
              const newDayDeclaration = await dailyDeclarationApi.getNewDailyDeclarationDetail(createResponse.data.toString());
              setTodayDeclaration(newDayDeclaration.data);
            }
          } catch (createError) {
            console.error('创建今日宣告失败:', createError);
            setTodayDeclaration(null);
          }
        } else {
          setTodayDeclaration(todayResponse.data || null);
        }

        try {
          // 获取历史宣告列表
          const historyResponse = await dailyDeclarationApi.getBookDailyDeclarations(bookId);

          if (historyResponse.data) {
            // 获取今天的日期字符串
            const today = new Date().toISOString().split('T')[0];

            // 设置历史宣告（排除今天的）
            const sortedDeclarations = historyResponse.data
              .filter(declaration => declaration.declarationDate !== today)
              .sort((a, b) => new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime());
            setHistoricalDeclarations(sortedDeclarations);
          }
        } catch (error: any) {
          // 如果是 500 错误，说明没有历史记录
          if (error.response?.status === 500) {
            setHistoricalDeclarations([]);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('获取日宣告失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeclarations();
  }, []);

  // 将历史宣告数据转换为展示格式
  const historicalDailyData = useMemo(() => {
    return historicalDeclarations.map(declaration => ({
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
        goals: declaration.dailyGoals?.map(goal => ({
          content: goal.title,
          unit: goal.unit,
        })) || [],
        weeklyProgress: '0/0',
        monthlyProgress: '0/0',
      },
    }));
  }, [historicalDeclarations]);

  // 更新剩余时间的副作用
  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setHours(21, 0, 0);

      if (now > deadline) {
        setRemainingTime('今日晚宣告已截止');
        return;
      }

      const diff = deadline.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemainingTime(`距离晚宣告截止还有 ${hours} 小时 ${minutes} 分钟`);
    };

    // 初始更新和定时更新
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-1">
      {/* 截止时间提醒 */}
      <View className="mb-2 mt-2 flex-row items-center justify-center">
        <Ionicons name="warning" size={16} color="#ef4444" />
        <Text className="ml-2 text-sm text-red-500">{remainingTime}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={[
            // 如果有今日宣告数据，将其添加到列表最前面
            ...(todayDeclaration ? [{
              date: new Date(todayDeclaration.declarationDate),
              timeSlots: [
                {
                  title: '上午',
                  items: [{ content: todayDeclaration.morningPlan || '', time: '7:00' }],
                },
                {
                  title: '中午',
                  items: [{ content: todayDeclaration.noonPlan || '', time: '12:00' }],
                },
                {
                  title: '下午',
                  items: [{ content: todayDeclaration.afternoonPlan || '', time: '14:00' }],
                },
                {
                  title: '晚上',
                  items: [{ content: todayDeclaration.eveningPlan || '', time: '19:00' }],
                },
              ],
              eveningContent: '',
              eveningStatus: 'pending' as const,
              eveningReport: [
                { label: '打分', value: todayDeclaration.dayScore || '' },
                { label: '体验', value: todayDeclaration.dayExperience || '' },
                { label: '行得通', value: todayDeclaration.whatWorked || '' },
                { label: '行不通', value: todayDeclaration.whatDidntWork || '' },
                { label: '学习到', value: todayDeclaration.whatLearned || '' },
                { label: '下一步', value: todayDeclaration.whatNext || '' },
              ],
              dailyResult: {
                goals: todayDeclaration.dailyGoals?.map(goal => ({
                  content: goal.title,
                  unit: goal.unit,
                })) || [],
                weeklyProgress: '0/0',
                monthlyProgress: '0/0',
              },
            }] : []),
            ...historicalDailyData,
          ]}
          renderItem={({ item }) => <DailyDeclarationItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 160, // 确保底部内容不被导航栏遮挡
          }}
        />
      )}
    </View>
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
