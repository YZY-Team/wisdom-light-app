import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { tutorApi, StudentDeclaration } from '~/api/who/tutor';
import { Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

type TabProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

const Tab = ({ title, isActive, onPress }: TabProps) => (
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

export default function StudentInfoPage() {
  const { studentId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentDeclaration | null>(null);

  const [activeTab, setActiveTab] = useState('daily');

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
          <View key={declaration.id} className="mb-6 rounded-lg bg-white p-4 shadow">
            <View className="mb-4 flex-row items-center justify-center">
              <View className="flex-row items-center">
                <Text className="text-[16px] font-bold text-black">第</Text>
                <Text className="text-[20px] font-bold text-[#F18318]">
                  {declaration.dayNumber}
                </Text>
                <Text className="text-[16px] font-bold text-black">天</Text>
                <Text className="ml-2 text-[14px] text-gray-500">
                  ({new Date(declaration.declarationDate).toLocaleDateString()})
                </Text>
              </View>
            </View>

            <View className="mb-3">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
                <Text className="text-[16px] font-bold text-white">早宣告</Text>
              </LinearGradient>
              <View className="rounded-b-xl border border-gray-100 bg-white p-4">
                <Text className="mb-1 text-base font-semibold">早晨计划</Text>
                <Text className="mb-4 text-gray-700">{declaration.morningPlan}</Text>

                <Text className="mb-1 text-base font-semibold">中午计划</Text>
                <Text className="mb-4 text-gray-700">{declaration.noonPlan}</Text>

                <Text className="mb-1 text-base font-semibold">下午计划</Text>
                <Text className="mb-4 text-gray-700">{declaration.afternoonPlan}</Text>

                <Text className="mb-1 text-base font-semibold">晚上计划</Text>
                <Text className="text-gray-700">{declaration.eveningPlan}</Text>
              </View>
            </View>

            <View className="mb-3">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
                <Text className="text-[16px] font-bold text-white">晚总结</Text>
              </LinearGradient>
              <View className="rounded-b-xl border border-gray-100 bg-white p-4">
                <Text className="mb-1 text-base font-semibold">当天评分</Text>
                <Text className="mb-4 text-gray-700">{declaration.dayScore}</Text>

                <Text className="mb-1 text-base font-semibold">当天体验</Text>
                <Text className="mb-4 text-gray-700">{declaration.dayExperience}</Text>

                <Text className="mb-1 text-base font-semibold">有效方法</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatWorked}</Text>

                <Text className="mb-1 text-base font-semibold">无效方法</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatDidntWork}</Text>

                <Text className="mb-1 text-base font-semibold">学到的经验</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatLearned}</Text>

                <Text className="mb-1 text-base font-semibold">下一步行动</Text>
                <Text className="text-gray-700">{declaration.whatNext}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View className="flex-1 items-center justify-center py-10">
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
          <View key={declaration.id} className="mb-6 rounded-lg bg-white shadow">
            <View className="mb-4 flex-row items-center justify-center p-4">
              <View className="flex-row items-center">
                <Text className="text-[16px] font-bold text-black">第</Text>
                <Text className="text-[20px] font-bold text-[#F18318]">
                  {declaration.weekNumber}
                </Text>
                <Text className="mr-4 text-[16px] font-bold text-black">周宣告</Text>
                <Text className="text-[16px] font-bold text-[#1483FD]">
                  {declaration.title || '未设置标题'}
                </Text>
              </View>
            </View>

            <View className="mb-3">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
                <Text className="text-[16px] font-bold text-white">成果宣告</Text>
                <Text className="ml-auto text-[14px] text-white">
                  {new Date(declaration.weekStartDate).toLocaleDateString()} -{' '}
                  {new Date(declaration.weekEndDate).toLocaleDateString()}
                </Text>
              </LinearGradient>
              <View className="border border-gray-100 bg-white p-4">
                <View className="mb-4 flex-row items-center">
                  <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
                  <Text className="text-[16px] font-bold">本周宣告</Text>
                </View>
                <Text className="mb-6 text-gray-700">{declaration.declarationContent}</Text>

                <View className="mb-4 flex-row items-center">
                  <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
                  <Text className="text-[16px] font-bold">成就</Text>
                </View>
                <Text className="mb-6 text-gray-700">{declaration.achievement}</Text>

                <View className="mb-4 flex-row items-center">
                  <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
                  <Text className="text-[16px] font-bold">自我总结</Text>
                </View>
                <Text className="mb-6 text-gray-700">{declaration.selfSummary}</Text>

                <View className="mb-4 flex-row items-center">
                  <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
                  <Text className="text-[16px] font-bold">六步总结</Text>
                </View>
                <Text className="mb-6 text-gray-700">{declaration.summary123456}</Text>

                <View className="mb-4 flex-row items-center">
                  <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
                  <Text className="text-[16px] font-bold">下一步</Text>
                </View>
                <Text className="text-gray-700">{declaration.nextStep}</Text>
              </View>
            </View>

            <View className="mb-3">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
                <Text className="text-[16px] font-bold text-white">周总结</Text>
              </LinearGradient>
              <View className="rounded-b-xl border border-gray-100 bg-white p-4">
                <Text className="mb-1 text-base font-semibold">周评分</Text>
                <Text className="mb-4 text-gray-700">{declaration.weekScore}</Text>

                <Text className="mb-1 text-base font-semibold">周体验</Text>
                <Text className="mb-4 text-gray-700">{declaration.weekExperience}</Text>

                <Text className="mb-1 text-base font-semibold">有效方法</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatWorked}</Text>

                <Text className="mb-1 text-base font-semibold">无效方法</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatDidntWork}</Text>

                <Text className="mb-1 text-base font-semibold">学到的经验</Text>
                <Text className="mb-4 text-gray-700">{declaration.whatLearned}</Text>

                <Text className="mb-1 text-base font-semibold">下一步行动</Text>
                <Text className="text-gray-700">{declaration.whatNext}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-500">暂无周宣告记录</Text>
        </View>
      )}
    </ScrollView>
  );

  // 成就书内容
  const AchievementBookScene = () => (
    <ScrollView className="flex-1 p-4">
      {studentData?.achievementBook ? (
        <View className="rounded-lg bg-white p-4 shadow">
          <View className="mb-6 flex-row items-center">
            <View className="mr-4 h-20 w-20 overflow-hidden rounded-full">
              <Image
                source={{ uri: studentData.studentAvatarUrl || undefined }}
                className="h-full w-full"
                placeholder={require('~/assets/images/who/tutor/image.png')}
              />
            </View>
            <View>
              <Text className="text-xl font-bold">{studentData.achievementBook.name}</Text>
              <Text className="text-gray-600">昵称: {studentData.achievementBook.nickname}</Text>
            </View>
          </View>

          <View className="mb-4">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
              <Text className="text-[16px] font-bold text-white">个人信息</Text>
            </LinearGradient>
            <View className="border border-gray-100 bg-white p-4">
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">性别</Text>
                <Text className="text-gray-700">{studentData.achievementBook.gender}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">年龄</Text>
                <Text className="text-gray-700">{studentData.achievementBook.age}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">婚姻状况</Text>
                <Text className="text-gray-700">{studentData.achievementBook.maritalStatus}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">子女状况</Text>
                <Text className="text-gray-700">{studentData.achievementBook.childrenStatus}</Text>
              </View>
            </View>
          </View>

          <View className="mb-4">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
              <Text className="text-[16px] font-bold text-white">联系方式</Text>
            </LinearGradient>
            <View className="border border-gray-100 bg-white p-4">
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">联系电话</Text>
                <Text className="text-gray-700">{studentData.achievementBook.phone}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">电子邮箱</Text>
                <Text className="text-gray-700">{studentData.achievementBook.email}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">家庭住址</Text>
                <Text className="text-gray-700">{studentData.achievementBook.homeAddress}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">紧急联系人</Text>
                <Text className="text-gray-700">
                  {studentData.achievementBook.emergencyContact}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-4">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
              <Text className="text-[16px] font-bold text-white">职业信息</Text>
            </LinearGradient>
            <View className="border border-gray-100 bg-white p-4">
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">公司名称</Text>
                <Text className="text-gray-700">{studentData.achievementBook.companyName}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">职位</Text>
                <Text className="text-gray-700">{studentData.achievementBook.position}</Text>
              </View>
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">公司地址</Text>
                <Text className="text-gray-700">{studentData.achievementBook.companyAddress}</Text>
              </View>
            </View>
          </View>

          <View className="mb-4">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
              <Text className="text-[16px] font-bold text-white">誓言与承诺</Text>
            </LinearGradient>
            <View className="border border-gray-100 bg-white p-4">
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">誓言</Text>
                <Text className="text-gray-700">{studentData.achievementBook.oath}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">承诺</Text>
                <Text className="text-gray-700">{studentData.achievementBook.promise}</Text>
              </View>
            </View>
          </View>

          <View>
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[38px] flex-row items-center rounded-t-xl px-4">
              <Text className="text-[16px] font-bold text-white">会员信息</Text>
            </LinearGradient>
            <View className="rounded-b-xl border border-gray-100 bg-white p-4">
              <View className="mb-3">
                <Text className="mb-1 text-base font-semibold">会员开始日期</Text>
                <Text className="text-gray-700">
                  {studentData.achievementBook.membershipStartDate
                    ? new Date(studentData.achievementBook.membershipStartDate).toLocaleDateString()
                    : '无'}
                </Text>
              </View>

              <View>
                <Text className="mb-1 text-base font-semibold">会员结束日期</Text>
                <Text className="text-gray-700">
                  {studentData.achievementBook.membershipEndDate
                    ? new Date(studentData.achievementBook.membershipEndDate).toLocaleDateString()
                    : '无'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-500">暂无成就书记录</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyDeclarationScene />;
      case 'weekly':
        return <WeeklyDeclarationScene />;
      case 'achievement':
        return <AchievementBookScene />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1483FD" />
        <Text className="mt-2 text-gray-500">加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-[#1483FD] px-4 py-2"
          onPress={() => {
            if (studentId) {
              tutorApi
                .getStudentDeclarations(studentId as string)
                .then((response) => {
                  if (response && response.data) {
                    setStudentData(response.data);
                    setError(null);
                  }
                })
                .catch((err) => {
                  console.error('重试获取学员详情失败:', err);
                  setError('获取学员详情失败，请稍后再试');
                });
            }
          }}>
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F8FC]">
      {/* 学员基本信息头部 */}
      <View className="border-b border-gray-200 bg-white p-4">
        <View className="flex-row items-center">
          <View className="mr-4 h-16 w-16 overflow-hidden rounded-full">
            <Image
              source={{ uri: studentData?.studentAvatarUrl || undefined }}
              className="h-full w-full"
              placeholder={require('~/assets/images/who/tutor/image.png')}
            />
          </View>
          <View>
            <Text className="text-xl font-bold">{studentData?.studentNickname}</Text>
            <Text className="text-gray-600">ID: {studentData?.studentId}</Text>
          </View>
        </View>
      </View>

      {/* 导航栏 */}
      <View className="mx-4 mt-3 flex-row gap-[36px] rounded-[8px] bg-[#1687fd]/10 p-2">
        <Tab
          title="日宣告"
          isActive={activeTab === 'daily'}
          onPress={() => setActiveTab('daily')}
        />
        <Tab
          title="周宣告"
          isActive={activeTab === 'weekly'}
          onPress={() => setActiveTab('weekly')}
        />
        <Tab
          title="成就书"
          isActive={activeTab === 'achievement'}
          onPress={() => setActiveTab('achievement')}
        />
      </View>

      {/* 内容区域 */}
      {renderContent()}
    </View>
  );
}
