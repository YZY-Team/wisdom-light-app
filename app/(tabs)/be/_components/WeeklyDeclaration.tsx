import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { weeklyDeclarationApi } from '~/api/be/weeklyDeclaration';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

const BOOK_ID = '1911671090439000066'; // TODO: 从路由或者props中获取

export default function WeeklyDeclaration() {
  const [currentDeclaration, setCurrentDeclaration] = useState<WeeklyDeclarationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeeklyDeclaration = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. 先获取当前周宣告
        const currentResponse = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(BOOK_ID);
        console.log("currentResponse",currentResponse);
        
        if (currentResponse.code===200) {
          setCurrentDeclaration(currentResponse.data);
          return;
        }

        // 2. 如果没有当前周宣告，创建一个新的
        const newDeclaration: Omit<WeeklyDeclarationDTO, 'id'> = {
          bookId: BOOK_ID,
          weekNumber: 1, // TODO: 计算当前是第几周
          title: '', // 可以根据需要设置默认标题
          declarationContent: '',
          weekStartDate: new Date().toISOString().split('T')[0], // 当前日期
          weekEndDate: new Date().toISOString().split('T')[0], // TODO: 计算周结束日期
          achievement: '',
          selfSummary: '',
          summary123456: '',
          nextStep: '',
          weekScore: '',
          weekExperience: '',
          whatWorked: '',
          whatDidntWork: '',
          whatLearned: '',
          whatNext: '',
          weeklyGoals: [],
          averageCompletionRate: 0,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        };

        const createResponse = await weeklyDeclarationApi.createWeeklyDeclaration(newDeclaration);
        if (createResponse.code === 200) {
          // 创建成功后，重新获取当前周宣告
          const latestResponse = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(BOOK_ID);
          if (latestResponse) {
            setCurrentDeclaration(latestResponse.data);
          }
        } else {
          setError('创建周宣告失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取或创建周宣告失败');
      } finally {
        setLoading(false);
      }
    };

    initializeWeeklyDeclaration();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!currentDeclaration) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>暂无周宣告数据</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 160,
      }}>
      {/* 标题部分 */}
      <View className="mb-4 flex-col items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-base font-medium">
            第{currentDeclaration.weekNumber}周宣告:{currentDeclaration.title || '未设置标题'}
          </Text>
          <Pressable className="ml-2">
            <Ionicons name="create-outline" size={16} color="#1483fd" />
          </Pressable>
        </View>
        <Text className="text-sm text-gray-400">
          {new Date(currentDeclaration.weekStartDate).toLocaleDateString()} - {new Date(currentDeclaration.weekEndDate).toLocaleDateString()}
        </Text>
      </View>

      {/* 成果宣告 */}
      <View className="mb-4 overflow-hidden rounded-xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px] justify-center px-4">
          <Text className="font-bold text-[16px] text-white">成果宣告</Text>
        </LinearGradient>
        <View className="">
          <TextInput
            className="min-h-[80px] rounded-lg p-3"
            placeholder="请输入宣告成果..."
            multiline
            value={currentDeclaration.declarationContent}
            onChangeText={(text) => {
              setCurrentDeclaration((prev) => 
                prev ? { ...prev, declarationContent: text } : null
              );
            }}
          />
        </View>
      </View>

      {/* 行动计划 */}
      <View className="mb-4 overflow-hidden rounded-2xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px]  justify-center px-4">
          <Text className="font-bold text-[16px] text-white">行动计划</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 星期选择器 */}
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <Pressable
                  key={day}
                  className={`mr-4 ${index === 0 ? 'border-b-2 border-[#1483FD]' : ''}`}>
                  <Text className={`text-base ${index === 0 ? 'text-[#1483FD]' : 'text-gray-400'}`}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="flex-col">
            {/* 左侧标签 */}
            <View className="mr-4 items-center">
              <View className="flex flex-row justify-between gap-2 py-2">
                <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                  {[...'个人成就计划'].map((char, index) => (
                    <Text key={index} className="text-[16px]   font-bold">
                      {char}
                    </Text>
                  ))}
                </View>
                <View className="flex flex-1 flex-col gap-2">
                  {['上午', '中午', '下午', '晚上'].map((time) => (
                    <View key={time} className="">
                      <View className="relative min-h-[50px] rounded-lg bg-[#F5F8FF]">
                        <View className="absolute left-3 top-3 z-10">
                          <Text className="text-[12px] text-gray-600">{time}：</Text>
                        </View>
                        <TextInput
                          className="p-3 pl-[45px] text-[12px]"
                          placeholderTextColor="#9CA3AF"
                          placeholder="今天我计划完成项目报告的初稿，并与团队讨论下一步计划。我会保..."
                          multiline
                          textAlignVertical="top"
                          defaultValue=""
                          selection={{ start: 0, end: 0 }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className="mr-4 items-center">
              <View className="flex flex-row justify-between gap-2 py-2">
                <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                  {[...'完成情况'].map((char, index) => (
                    <Text key={index} className="text-[16px]   font-bold">
                      {char}
                    </Text>
                  ))}
                </View>
                <View className="flex flex-1 flex-col gap-2">
                  <View className="relative  rounded-lg bg-[#F5F8FF]">
                    <TextInput
                      className="min-h-[130px] p-3 pl-[12px] text-[12px]"
                      placeholderTextColor="#9CA3AF"
                      placeholder="请输入..."
                      multiline
                      textAlignVertical="top"
                      defaultValue=""
                      selection={{ start: 0, end: 0 }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 第1周总结 */}
      <View className="mb-4 overflow-hidden rounded-xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px]  justify-center px-4">
          <Text className="font-bold text-[16px] text-white">第{currentDeclaration.weekNumber}周总结</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 进度条 */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className=" text-[16px]  font-bold">本周达成:</Text>
            <View className="ml-2 mr-4 h-2 w-[60%] rounded-full bg-gray-200">
              <View 
                className="h-full rounded-full bg-[#20B4F3]" 
                style={{ width: `${currentDeclaration.averageCompletionRate}%` }}
              />
            </View>
            <Text className="text-[#FF9F21]">{currentDeclaration.averageCompletionRate}%</Text>
          </View>
          <View className="mb-4 flex-row gap-1">
            <Text className="mb-2 text-sm ">达成成果:</Text>
            <TextInput
              className="min-h-[60px] text-sm flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
              value={currentDeclaration.achievement}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, achievement: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2    text-[14px] font-bold">从本周成果和行动出发自我总结:</Text>
            <TextInput
              className="min-h-[60px] text-sm flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
              value={currentDeclaration.selfSummary}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, selfSummary: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2 text-sm ">
              123、4+5+6本周我运用了哪些?特别有体验的是哪条,为什么?
            </Text>
            <TextInput
              className="min-h-[60px] text-sm flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
              value={currentDeclaration.summary123456}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, summary123456: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2 text-sm ">我的下一步:</Text>
            <TextInput
              className="min-h-[60px] text-sm flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
              value={currentDeclaration.nextStep}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, nextStep: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">本周打分:</Text>
            <TextInput
              className="min-h-[36px] flex-1 text-sm rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              value={currentDeclaration.weekScore}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, weekScore: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">本周体验:</Text>
            <TextInput
              className="min-h-[36px] flex-1 text-sm rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              value={currentDeclaration.weekExperience}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, weekExperience: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]   text-sm">行得通:</Text>
            <TextInput
              className="min-h-[36px] flex-1 text-sm rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              value={currentDeclaration.whatWorked}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, whatWorked: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">学习到:</Text>
            <TextInput
              className="min-h-[36px] flex-1 text-sm rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              value={currentDeclaration.whatLearned}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, whatLearned: text } : null
                );
              }}
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">下一步:</Text>
            <TextInput
              className="min-h-[36px] flex-1 text-sm rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              value={currentDeclaration.whatNext}
              onChangeText={(text) => {
                setCurrentDeclaration((prev) => 
                  prev ? { ...prev, whatNext: text } : null
                );
              }}
            />
          </View>

          {/* 周目标列表 */}
          <View className="mt-4">
            <Text className="mb-2 text-[16px] font-bold">周目标:</Text>
            {currentDeclaration.weeklyGoals.map((goal, index) => (
              <View key={goal.goalId} className="mb-2 rounded-lg bg-[#F5F8FF] p-3">
                <Text className="text-sm font-medium">{goal.title}</Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">
                    目标: {goal.targetQuantity} {goal.unit}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    已完成: {goal.completedQuantity} {goal.unit}
                  </Text>
                  <Text className="text-sm text-[#FF9F21]">
                    完成率: {goal.completionRate}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
