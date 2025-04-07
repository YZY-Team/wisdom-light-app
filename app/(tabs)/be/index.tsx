import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DailyDeclaration from './_components/DailyDeclaration';
import WeeklyDeclaration from './_components/WeeklyDeclaration';
import Achievements from './_components/Achievements';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyDeclaration />;
      case 'weekly':
        return <WeeklyDeclaration />;
      case 'achievements':
        return <Achievements />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5] px-4 pt-3">
      {/* 导航栏 */}
      <View className="flex-row gap-[36px]  rounded-[8px] bg-[#1687fd]/10 p-2">
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
