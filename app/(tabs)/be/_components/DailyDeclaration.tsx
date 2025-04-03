import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

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

export function DailyDeclaration() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [noonContent, setNoonContent] = useState('');
  const [noonStatus, setNoonStatus] = useState<'completed' | 'pending'>('pending');
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
    <ScrollView className="flex-1 px-4 pt-7">
      {/* 日期头部 */}
      <View className="items-center py-4 ">
        <Text className="text-lg font-semibold">
          <Text>{currentDate.getFullYear()}</Text>
          <Text className="text-[#1483FD]">{currentDate.getFullYear()}</Text>
          <Text>年</Text>
          <Text className="text-[#1483FD]">{currentDate.getMonth() + 1}</Text>
          <Text>月</Text>
          <Text className="text-[#1483FD]">{currentDate.getDate()}</Text>
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

      <DeclarationCard
        title="早宣告"
        time="7:00 AM"
        status="completed"
        content="今天我计划完成项目报告的初稿，并与团队讨论下一步计划，我会保持专注和积极的态度面对挑战。"
      />

      <DeclarationCard
        title="中午宣告"
        time="12:00 PM"
        status={noonStatus}
        content={noonStatus === 'completed' ? noonContent : undefined}
        inputValue={noonContent}
        onInputChange={setNoonContent}
        onSubmit={() => {
          if (!noonContent.trim()) return;
          setNoonStatus('completed');
        }}
      />

      <DeclarationCard 
        title="晚宣告" 
        time="9:00 PM" 
        status={eveningStatus}
        content={eveningStatus === 'completed' ? eveningContent : undefined}
        inputValue={eveningContent}
        onInputChange={setEveningContent}
      />
      {/* 提交按钮 */}
      {eveningStatus === 'pending' && (
        <View className="px-4 py-3">
          <Pressable 
            className="items-center rounded-lg bg-blue-500 py-3" 
            onPress={handleSubmit}
          >
            <Text className="font-semibold text-white">提交晚宣告</Text>
          </Pressable>
        </View>
      )}
      {/* 提醒信息 */}
      <View className="mb-8 mt-4 flex-row items-center justify-center">
        <Ionicons name="warning" size={16} color="#ef4444" />
        <Text className="ml-2 text-sm text-red-500">{remainingTime}</Text>
      </View>
    </ScrollView>
  );
}