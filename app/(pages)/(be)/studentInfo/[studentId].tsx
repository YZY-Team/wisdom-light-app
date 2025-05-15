import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { tutorApi, StudentDeclaration } from '~/api/who/tutor';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

cssInterop(Image, { className: 'style' });

const initialLayout = { width: Dimensions.get('window').width };

export default function StudentInfoPage() {
  const { studentId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentDeclaration | null>(null);
  
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'daily', title: '日宣告' },
    { key: 'weekly', title: '周宣告' },
    { key: 'achievement', title: '成就书' },
  ]);

  console.log("studentData", studentData);
  useEffect(() => {
    if (!studentId) return;
    
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await tutorApi.getStudentDeclarations(studentId as string);
        // 从API响应中提取数据
        if (response && response.data) {
          setStudentData(response.data);
        } else {
          console.error('获取数据失败:', response);
          throw new Error('获取数据失败');
        }
        setError(null);
      } catch (err) {
        console.error('获取学员详情失败:', err);
        setError('获取学员详情失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  // 日宣告内容
  const DailyDeclarationScene = () => (
    <ScrollView className="flex-1 p-4">
      {studentData?.recentDailyDeclarations && studentData.recentDailyDeclarations.length > 0 ? (
        studentData.recentDailyDeclarations.map((declaration) => (
          <View key={declaration.id} className="mb-6 p-4 bg-white rounded-lg shadow">
            <Text className="text-lg font-bold mb-2">第 {declaration.dayNumber} 天 ({new Date(declaration.declarationDate).toLocaleDateString()})</Text>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">早晨计划</Text>
              <Text className="text-gray-700">{declaration.morningPlan}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">中午计划</Text>
              <Text className="text-gray-700">{declaration.noonPlan}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">下午计划</Text>
              <Text className="text-gray-700">{declaration.afternoonPlan}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">晚上计划</Text>
              <Text className="text-gray-700">{declaration.eveningPlan}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">当天评分</Text>
              <Text className="text-gray-700">{declaration.dayScore}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">当天体验</Text>
              <Text className="text-gray-700">{declaration.dayExperience}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">有效方法</Text>
              <Text className="text-gray-700">{declaration.whatWorked}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">无效方法</Text>
              <Text className="text-gray-700">{declaration.whatDidntWork}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">学到的经验</Text>
              <Text className="text-gray-700">{declaration.whatLearned}</Text>
            </View>
            
            <View>
              <Text className="text-base font-semibold mb-1">下一步行动</Text>
              <Text className="text-gray-700">{declaration.whatNext}</Text>
            </View>
          </View>
        ))
      ) : (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-gray-500">暂无日宣告记录</Text>
        </View>
      )}
    </ScrollView>
  );

  // 周宣告内容
  const WeeklyDeclarationScene = () => (
    <ScrollView className="flex-1 p-4">
      {studentData?.recentWeeklyDeclarations && studentData.recentWeeklyDeclarations.length > 0 ? (
        studentData.recentWeeklyDeclarations.map((declaration) => (
          <View key={declaration.id} className="mb-6 p-4 bg-white rounded-lg shadow">
            <Text className="text-lg font-bold mb-2">第 {declaration.weekNumber} 周 ({new Date(declaration.weekStartDate).toLocaleDateString()} - {new Date(declaration.weekEndDate).toLocaleDateString()})</Text>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">标题</Text>
              <Text className="text-gray-700">{declaration.title}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">宣告内容</Text>
              <Text className="text-gray-700">{declaration.declarationContent}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">成就</Text>
              <Text className="text-gray-700">{declaration.achievement}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">自我总结</Text>
              <Text className="text-gray-700">{declaration.selfSummary}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">六步总结</Text>
              <Text className="text-gray-700">{declaration.summary123456}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">下一步</Text>
              <Text className="text-gray-700">{declaration.nextStep}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">周评分</Text>
              <Text className="text-gray-700">{declaration.weekScore}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">周体验</Text>
              <Text className="text-gray-700">{declaration.weekExperience}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">有效方法</Text>
              <Text className="text-gray-700">{declaration.whatWorked}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">无效方法</Text>
              <Text className="text-gray-700">{declaration.whatDidntWork}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-base font-semibold mb-1">学到的经验</Text>
              <Text className="text-gray-700">{declaration.whatLearned}</Text>
            </View>
            
            <View>
              <Text className="text-base font-semibold mb-1">下一步行动</Text>
              <Text className="text-gray-700">{declaration.whatNext}</Text>
            </View>
          </View>
        ))
      ) : (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-gray-500">暂无周宣告记录</Text>
        </View>
      )}
    </ScrollView>
  );

  // 成就书内容
  const AchievementBookScene = () => (
    <ScrollView className="flex-1 p-4">
      {studentData?.achievementBook ? (
        <View className="p-4 bg-white rounded-lg shadow">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-full overflow-hidden mr-4">
              <Image
                source={{ uri: studentData.studentAvatarUrl || undefined }}
                className="w-full h-full"
                placeholder={require('~/assets/images/who/tutor/image.png')}
              />
            </View>
            <View>
              <Text className="text-xl font-bold">{studentData.achievementBook.name}</Text>
              <Text className="text-gray-600">昵称: {studentData.achievementBook.nickname}</Text>
            </View>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">性别</Text>
            <Text className="text-gray-700">{studentData.achievementBook.gender}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">年龄</Text>
            <Text className="text-gray-700">{studentData.achievementBook.age}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">婚姻状况</Text>
            <Text className="text-gray-700">{studentData.achievementBook.maritalStatus}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">子女状况</Text>
            <Text className="text-gray-700">{studentData.achievementBook.childrenStatus}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">联系电话</Text>
            <Text className="text-gray-700">{studentData.achievementBook.phone}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">电子邮箱</Text>
            <Text className="text-gray-700">{studentData.achievementBook.email}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">公司名称</Text>
            <Text className="text-gray-700">{studentData.achievementBook.companyName}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">职位</Text>
            <Text className="text-gray-700">{studentData.achievementBook.position}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">公司规模</Text>
            <Text className="text-gray-700">{studentData.achievementBook.companySize}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">年收入</Text>
            <Text className="text-gray-700">{studentData.achievementBook.annualIncome}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">公司地址</Text>
            <Text className="text-gray-700">{studentData.achievementBook.companyAddress}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">紧急联系人</Text>
            <Text className="text-gray-700">{studentData.achievementBook.emergencyContact}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">家庭住址</Text>
            <Text className="text-gray-700">{studentData.achievementBook.homeAddress}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">誓言</Text>
            <Text className="text-gray-700">{studentData.achievementBook.oath}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">承诺</Text>
            <Text className="text-gray-700">{studentData.achievementBook.promise}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-base font-semibold mb-1">会员开始日期</Text>
            <Text className="text-gray-700">{studentData.achievementBook.membershipStartDate ? new Date(studentData.achievementBook.membershipStartDate).toLocaleDateString() : '无'}</Text>
          </View>
          
          <View>
            <Text className="text-base font-semibold mb-1">会员结束日期</Text>
            <Text className="text-gray-700">{studentData.achievementBook.membershipEndDate ? new Date(studentData.achievementBook.membershipEndDate).toLocaleDateString() : '无'}</Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-gray-500">暂无成就书记录</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderScene = SceneMap({
    daily: DailyDeclarationScene,
    weekly: WeeklyDeclarationScene,
    achievement: AchievementBookScene,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#1483FD' }}
      style={{ backgroundColor: 'white' }}
      labelStyle={{ color: 'black', fontWeight: '600' }}
      activeColor="#1483FD"
    />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1483FD" />
        <Text className="mt-2 text-gray-500">加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity 
          className="mt-4 px-4 py-2 bg-[#1483FD] rounded-lg"
          onPress={() => {
            if (studentId) {
              tutorApi.getStudentDeclarations(studentId as string)
                .then(response => {
                  if (response && response.data) {
                    setStudentData(response.data);
                    setError(null);
                  }
                })
                .catch(err => {
                  console.error('重试获取学员详情失败:', err);
                  setError('获取学员详情失败，请稍后再试');
                });
            }
          }}
        >
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* 学员基本信息头部 */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full overflow-hidden mr-4">
            <Image
              source={{ uri: studentData?.studentAvatarUrl || undefined }}
              className="w-full h-full"
              placeholder={require('~/assets/images/who/tutor/image.png')}
            />
          </View>
          <View>
            <Text className="text-xl font-bold">{studentData?.studentNickname}</Text>
            <Text className="text-gray-600">ID: {studentData?.studentId}</Text>
          </View>
        </View>
      </View>

      {/* 标签页内容 */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}
