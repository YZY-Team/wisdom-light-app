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
          android_ripple={{color: 'rgba(255,255,255,0.2)'}}
          style={({pressed}) => [
            {opacity: pressed ? 0.9 : 1}
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

  // 使用useMemo生成过去7天的数据
  const dailyData = useMemo(() => {
    const data: DailyData[] = [];
    const today = new Date();

    // 生成过去6天的数据（不包括今天）
    for (let i = 1; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // 构建每日数据
      data.push({
        date,
        timeSlots: [
          {
            title: '上午',
            items: [
              {
                content: `${date.getMonth() + 1}月${date.getDate()}日 完成项目文档初稿`,
                time: '7:00',
              },
            ],
          },
          {
            title: '中午',
            items: [
              {
                content: `${date.getMonth() + 1}月${date.getDate()}日 整理上午工作进度`,
                time: '12:00',
              },
            ],
          },
          {
            title: '下午',
            items: [
              {
                content: `${date.getMonth() + 1}月${date.getDate()}日 进行项目评审会议`,
                time: '14:00',
              },
            ],
          },
          {
            title: '晚上',
            items: [
              {
                content: `${date.getMonth() + 1}月${date.getDate()}日 总结今日工作完成情况`,
                time: '19:00',
              },
            ],
          },
        ],
        eveningContent: i > 0 ? `${date.getMonth() + 1}月${date.getDate()}日晚总结内容` : '',
        eveningStatus: i > 0 ? 'completed' : 'pending',
        eveningReport: [
          { label: '打分', value: i > 0 ? '8分' : '' },
          { label: '体验', value: i > 0 ? '今天工作效率很高' : '' },
          { label: '行得通', value: i > 0 ? '团队协作流程顺畅' : '' },
          { label: '行不通', value: i > 0 ? '部分功能实现遇到技术难题' : '' },
          { label: '学习到', value: i > 0 ? '新的状态管理方法' : '' },
          { label: '下一步', value: i > 0 ? '优化性能问题' : '' },
        ],
        dailyResult: {
          goals:
            i > 0
              ? [
                {
                  content: `${date.getMonth() + 1}月${date.getDate()}日目标1：完成项目核心功能`,
                  unit: '个',
                },
                {
                  content: `${date.getMonth() + 1}月${date.getDate()}日目标2：完成团队会议`,
                  unit: '次',
                },
                {
                  content: `${date.getMonth() + 1}月${date.getDate()}日目标3：完成文档编写`,
                  unit: '份',
                },
              ]
              : [],
          weeklyProgress: '10/8',
          monthlyProgress: '10/8',
        },
      });
    }

    return data;
  }, []);

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

      {/* 宣告列表 */}
      <FlatList
        data={dailyData}
        renderItem={({ item }) => <DailyDeclarationItem item={item} />}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160, // 确保底部内容不被导航栏遮挡
        }}
      />
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
