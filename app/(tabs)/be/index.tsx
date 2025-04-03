import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabProps = {
  title: string;
  isActive?: boolean;
  href: string;
  onPress: () => void;
};

const Tab = ({ title, isActive, href, onPress }: TabProps) => (
  <Pressable
    className="flex-1 items-center border-b-2 py-3"
    style={{ borderColor: isActive ? '#007AFF' : 'transparent' }}
    onPress={onPress}>
    <Text style={{ color: isActive ? '#007AFF' : '#666666' }}>{title}</Text>
  </Pressable>
);

type DeclarationCardProps = {
  title: string;
  time: string;
  status: 'completed' | 'pending';
  content?: string;
  onSubmit?: () => void;
};

const DeclarationCard = ({
  title,
  time,
  status,
  content,
}: Omit<DeclarationCardProps, 'onSubmit'>) => (
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
        />
      </View>
    )}
  </View>
);

export default function BeIndex() {
  const [activeTab, setActiveTab] = useState('daily');

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <>
            <ScrollView className="flex-1 px-4">
              {/* 日期头部 */}
              <View className="items-center py-4">
                <Text className="text-lg font-semibold">2023年5月15日</Text>
                <Text className="text-sm text-gray-500">第20周 星期一</Text>
              </View>

              <DeclarationCard
                title="早宣告"
                time="7:00 AM"
                status="completed"
                content="今天我计划完成项目报告的初稿，并与团队讨论下一步计划，我会保持专注和积极的态度面对挑战。"
              />

              <DeclarationCard title="晚宣告" time="9:00 PM" status="pending" />
              {/* 提交按钮 */}
              <View className=" px-4 py-3">
                <Pressable className="items-center rounded-lg bg-blue-500 py-3" onPress={() => {}}>
                  <Text className="font-semibold text-white">提交晚宣告</Text>
                </Pressable>
              </View>
              {/* 提醒信息 */}
              <View className="mb-8 mt-4 flex-row items-center justify-center">
                <Ionicons name="warning" size={16} color="#ef4444" />
                <Text className="ml-2 text-sm text-red-500">距离晚宣告截止还有 3 小时 15 分钟</Text>
              </View>
            </ScrollView>
          </>
        );
      case 'weekly':
        return (
          <ScrollView className="flex-1 px-4">
            {/* 数据统计区域 */}
            <View className="flex-row flex-wrap justify-between py-4">
              <View className="mb-4 w-[48%] rounded-xl bg-white p-4">
                <Text className="text-center text-3xl font-bold text-blue-500">89</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">完成宣告</Text>
              </View>
              <View className="mb-4 w-[48%] rounded-xl bg-white p-4">
                <Text className="text-center text-3xl font-bold text-purple-500">12</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">课程学习</Text>
              </View>
              <View className="w-[48%] rounded-xl bg-white p-4">
                <Text className="text-center text-3xl font-bold text-green-500">8</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">成就解锁</Text>
              </View>
              <View className="w-[48%] rounded-xl bg-white p-4">
                <Text className="text-center text-3xl font-bold text-blue-500">80%</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">目标达成率</Text>
              </View>
            </View>

            {/* 任务列表 */}
            <Text className="mb-4 text-xl font-bold">总数据</Text>
            <View className="mb-4 rounded-xl bg-white">
              <Pressable className="border-b border-gray-100 p-4">
                <Text className="mb-1 text-base font-semibold">坚持不懈</Text>
                <Text className="text-sm text-gray-500">连续30天完成日宣告</Text>
                <Text className="mt-1 text-xs text-gray-400">开始于 2023/4/15</Text>
              </Pressable>
              <Pressable className="border-b border-gray-100 p-4">
                <Text className="mb-1 text-base font-semibold">求知若渴</Text>
                <Text className="text-sm text-gray-500">完成6门课程学习</Text>
                <Text className="mt-1 text-xs text-gray-400">开始于 2023/3/22</Text>
              </Pressable>
              <Pressable className="p-4">
                <Text className="mb-1 text-base font-semibold">团队领袖</Text>
                <Text className="text-sm text-gray-500">完成团队管理系列全部课程</Text>
                <Text className="mt-1 text-xs text-gray-400">开始于 2023/4/1</Text>
              </Pressable>
            </View>
          </ScrollView>
        );
      case 'achievements':
        return (
          <View className="flex-1 items-center justify-center">
            <Text>成就书内容</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* 导航栏 */}
      <View className="flex-row bg-white">
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
