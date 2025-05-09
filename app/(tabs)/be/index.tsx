import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import DailyDeclaration from '../../../components/screens/tabs/be/DailyDeclaration';
import WeeklyDeclaration from '../../../components/screens/tabs/be/WeeklyDeclaration';
import Achievements from '../../../components/screens/tabs/be/Achievements';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { useActiveAchievementBook } from '~/queries/achievement';
import { useUserStore } from '~/store/userStore';
import NoMemberTip from '~/components/screens/tabs/be/NoMemberTip';

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
  const { data: achievementBookResponse, isLoading: achievementBookLoading } = useActiveAchievementBook();
  const achievementBookId = achievementBookResponse?.data?.id || '';
  const achievementBook = achievementBookResponse?.data;

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
          tipText={activeTab === 'daily' 
            ? "充值会员之后才能拥有日宣告哦～" 
            : activeTab === 'weekly' 
              ? "充值会员之后才能拥有周宣告哦～"
              : "充值会员之后才能拥有成就书哦～"
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
