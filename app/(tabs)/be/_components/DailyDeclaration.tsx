import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
cssInterop(LinearGradient, { className: 'style' });
type DeclarationCardProps = {
  title: string;
  time: string;
  status: 'completed' | 'pending';
  content?: string;
  onSubmit?: (content: string) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
};

const DeclarationCard = ({
  title,
  time,
  status,
  content,
  onSubmit,
  inputValue,
  onInputChange,
}: DeclarationCardProps) => (
  <View className="mb-4 overflow-hidden rounded-xl bg-white">
    <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
      <Text className="text-base font-semibold">{title}</Text>
      <View className="flex-row items-center">
        <Text className="mr-2 text-xs text-gray-500">{time}</Text>
        <View
          className={`flex-row items-center rounded-full px-2 py-1 ${status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-circle-outline' : 'timer-outline'}
            size={12}
            color={status === 'completed' ? '#16a34a' : '#ca8a04'}
          />
          <Text
            className={`ml-1 text-xs ${status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
            {status === 'completed' ? '已完成' : '待完成'}
          </Text>
        </View>
      </View>
    </View>
    {content ? (
      <View className="p-4">
        <Text className="text-gray-600">{content}</Text>
      </View>
    ) : (
      <View className="p-4">
        <TextInput
          className="rounded-lg bg-gray-50 p-3 text-gray-600"
          placeholder="请输入今天的晚宣告内容..."
          multiline
          value={inputValue}
          onChangeText={onInputChange}
        />
      </View>
    )}
  </View>
);

type TimeSlot = {
  content: string;
  time: string;
};

export default function DailyDeclaration() {
  const [timeSlots, setTimeSlots] = useState<TimeSlotSection[]>([
    {
      title: '上午',
      items: [
        { content: '完成项目文档初稿', time: '7:00' },
        { content: '与团队进行晨会讨论', time: '8:00' },
        { content: '优化用户界面设计', time: '9:00' },
      ],
    },
    {
      title: '中午',
      items: [
        { content: '整理上午工作进度', time: '12:00' },
        { content: '准备下午会议材料', time: '13:00' },
      ],
    },
    {
      title: '下午',
      items: [
        { content: '进行项目评审会议', time: '14:00' },
        { content: '处理用户反馈问题', time: '15:00' },
      ],
    },
    {
      title: '晚上',
      items: [
        { content: '总结今日工作完成情况', time: '19:00' },
        { content: '规划明日工作重点', time: '20:00' },
      ],
    },
  ]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eveningContent, setEveningContent] = useState('');
  const [eveningStatus, setEveningStatus] = useState<'completed' | 'pending'>('pending');
  const [remainingTime, setRemainingTime] = useState('');

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

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (!eveningContent.trim()) {
      // 可以添加提示信息
      return;
    }
    setEveningStatus('completed');
  };

  const weekday = ['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()];
  const week = Math.ceil((currentDate.getDate() - currentDate.getDay()) / 7);

  return (
    <ScrollView 
          className="flex-1 px-4 pt-7"
          contentContainerStyle={{
            paddingBottom: 160 // 40 * 4，确保底部内容不被导航栏遮挡
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 日期头部 */}
          <View className="items-center py-4 ">
            <Text className="text-lg font-semibold">
              <Text>{currentDate.getFullYear()}</Text>
              <Text>年</Text>
              <Text>{currentDate.getMonth() + 1}</Text>
              <Text>月</Text>
              <Text>{currentDate.getDate()}</Text>
              <Text>日</Text>
            </Text>
            <Text className="text-sm text-gray-500">
              <Text>第</Text>
              <Text className="text-[#1483FD]">{week}</Text>
              <Text>天 第</Text>
              <Text className="text-[#1483FD]">{week}</Text>
              <Text>周 星期</Text>
              <Text className="text-[#1483FD]">{weekday}</Text>
            </Text>
          </View>

          {/* 早宣告计划部分 */}
          <View className="mb-4 overflow-hidden  rounded-xl bg-white">
            <LinearGradient
              colors={['#20A3FB', '#1483FD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-col items-start  justify-center rounded-t-xl px-4"
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
                早宣告
              </Text>
            </LinearGradient>

            <View className="p-4">
              {timeSlots.map((section, sectionIndex) => (
                <View key={section.title} className="mb-4 flex-row">
                  <View className="mr-4 h-[80px] flex-row items-center">
                    <View className="mr-2 h-8 w-1 rounded-full bg-[#1483FD]" />
                    <Text className="text-sm font-medium text-gray-700">{section.title}</Text>
                  </View>
                  <View className="flex flex-1 flex-col gap-2">
                    {section.items.map((item, itemIndex) => (
                      <TextInput
                        key={`${section.title}-${itemIndex}`}
                        className="h-[80px] rounded-[6px] bg-[#1483fd1a] p-3 text-gray-600"
                        style={{
                          backdropFilter: 'blur(10px)',
                        }}
                        placeholder={`请输入${section.title}的计划...`}
                        multiline
                        value={item.content}
                        onChangeText={(text) => {
                          const newTimeSlots = [...timeSlots];
                          newTimeSlots[sectionIndex].items[itemIndex].content = text;
                          setTimeSlots(newTimeSlots);
                        }}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 晚宣告部分保持不变 */}
          <DeclarationCard
            title="晚宣告"
            time="9:00 PM"
            status={eveningStatus}
            content={eveningStatus === 'completed' ? eveningContent : undefined}
            inputValue={eveningContent}
            onInputChange={setEveningContent}
          />

          {/* 提交按钮和提醒信息保持不变 */}
          {eveningStatus === 'pending' && (
            <View className="px-4 py-3">
              <Pressable className="items-center rounded-lg bg-blue-500 py-3" onPress={handleSubmit}>
                <Text className="font-semibold text-white">提交晚宣告</Text>
              </Pressable>
            </View>
          )}

          <View className="mb-8 mt-4 flex-row items-center justify-center">
            <Ionicons name="warning" size={16} color="#ef4444" />
            <Text className="ml-2 text-sm text-red-500">{remainingTime}</Text>
          </View>
        </ScrollView>
  );
}

// 首先在组件外定义类型
type TimeSlotItem = {
  content: string;
  time: string;
};

type TimeSlotSection = {
  title: string;
  items: TimeSlotItem[];
};

// 在组件内添加状态

// 渲染部分
