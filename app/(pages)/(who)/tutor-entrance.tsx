import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StudentsManagement from '../../components/tutor/StudentsManagement';
import IncomeManagement from '../../components/tutor/IncomeManagement';

// 定义标签类型
type TabType = 'students' | 'income';

export default function TutorEntranceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // 渲染标签按钮
  const renderTabButton = (tabName: string, type: TabType) => {
    const isActive = activeTab === type;
    return (
      <TouchableOpacity onPress={() => setActiveTab(type)}>
        <View className="pb-1 items-center">
          <Text 
            className={`text-[16px] ${isActive ? 'text-[#1483FD] ' : 'text-[rgba(0,0,0,0.5)]'}`}
          >
            {tabName}
          </Text>
          <View className={`h-[5px] w-[35px] bg-[#1483FD] mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsManagement />;
      case 'income':
        return <IncomeManagement />;
      default:
        return <StudentsManagement />;
    }
  };

  return (
    <View className="flex-1 ">
      {/* 顶部导航栏 */}
      <View className="px-4 py-4 bg-[#FFFFFFCC]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px]">导师入口</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 顶部标签栏 */}
      <View className=" px-4 py-2">
        <View className="flex-row items-center gap-8">
          {renderTabButton('学员管理', 'students')}
          {renderTabButton('我的收入', 'income')}
        </View>
      </View>

      {/* 内容区域 */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
} 