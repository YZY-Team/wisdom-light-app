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
  const [selectedDay, setSelectedDay] = useState(0);
  const [dailyPlans, setDailyPlans] = useState<Array<{
    achievementPlan: string;
    completion: string;
  }>>([
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
    { achievementPlan: '', completion: '' },
  ]);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const updateDailyPlan = (type: 'achievementPlan' | 'completion', text: string) => {
    setDailyPlans(prev => {
      const newPlans = [...prev];
      newPlans[selectedDay] = {
        ...newPlans[selectedDay],
        [type]: text
      };
      return newPlans;
    });
  };

  useEffect(() => {
    const initializeWeeklyDeclaration = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 先获取当前周宣告
        const currentResponse = await weeklyDeclarationApi.getCurrentWeeklyDeclaration(BOOK_ID);
        console.log("currentResponse", currentResponse);

        if (currentResponse.code === 200) {
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
      <View className="mb-4 flex-row items-center justify-center">
        <View className="flex-row items-center">
          <Text className="text-[16px] font-bold text-black">
            第
          </Text>
          <Text className="text-[20px] font-bold text-[#F18318]">
            {currentDeclaration.weekNumber}
          </Text>
          <Text className="text-[16px] mr-4 font-bold text-black">
            周宣告
          </Text>
          <Text className="text-[16px] font-bold text-[#1483FD]">
            {currentDeclaration.title || '未设置标题'}
          </Text>
        </View>
        <Pressable className="ml-2 flex-row items-center justify-center ">
          <Ionicons name="create-outline" size={16} color="#1483fd" />
        </Pressable>
      </View>

      {/* 成果宣告 */}
      <View className="mb-4 overflow-hidden rounded-[12px] bg-white">
        <Pressable
          onPress={toggleExpand}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [
            { opacity: pressed ? 0.9 : 1 }
          ]}>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}
            className="flex h-[38px] flex-row items-center justify-between px-4">
            <Text className="font-bold text-[16px] text-white">成果宣告</Text>
            <View className="flex-row items-center gap-4">
              <Text className="text-[16px] text-white mr-2">
                {new Date(currentDeclaration.weekStartDate).getFullYear()}年
                {new Date(currentDeclaration.weekStartDate).getMonth() + 1}月
                {new Date(currentDeclaration.weekStartDate).getDate()}日
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#fff"
              />
            </View>
          </LinearGradient>
        </Pressable>
        {isExpanded && (
          <View className="px-4 mt-8">
            {/* 本周宣告标题 */}
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 w-1 h-7 bg-[#1483FD]" />
              <Text className="text-[16px] font-bold">本周宣告</Text>
            </View>

            {/* 宣告内容输入框 */}
            <TextInput
              className="mb-4 min-h-[60px] rounded-lg bg-[#1483FD1A] p-4 text-[14px]"
              placeholder="请输入宣告成果"
              multiline
              value={currentDeclaration?.declarationContent}
              onChangeText={(text) => {
                if (text.length <= 150) {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, declarationContent: text } : null
                  );
                }
              }}
              maxLength={150}
            />

            {/* 本周目标标题 */}
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 w-1 h-7 bg-[#1483FD]" />
              <Text className="text-[16px] font-bold">本周目标</Text>
            </View>

            {/* 目标列表 */}
            {currentDeclaration.weeklyGoals.map((goal, index) => (
              <View key={goal.goalId} className="mb-4 gap-2 flex-row items-center justify-between">
                <Text className="text-[14px] font-[600]" >
                  目标{index + 1}{" "}:
                </Text>
                <View className="flex-row items-center flex-1 ml-2">
                  <View className="w-[70%]">
                    <TextInput
                      className="h-[36px] rounded-lg bg-[#1483FD0D] px-3"
                      placeholder="请输入数量"
                      keyboardType="numeric"
                      maxLength={10}
                      value={goal.targetQuantity.toString()}
                      onChangeText={(text) => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        const updatedGoals = [...currentDeclaration.weeklyGoals];
                        updatedGoals[index] = {
                          ...goal,
                          completedQuantity: parseInt(numericValue) || 0
                        };
                        setCurrentDeclaration(prev =>
                          prev ? { ...prev, weeklyGoals: updatedGoals } : null
                        );
                      }}
                    />
                  </View>
                  <Text className=" pl-7 flex-1 text-[14px] text-[#00000080]">
                    {goal.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 行动计划 */}
      {isExpanded && (
        <View className="mb-4 overflow-hidden rounded-[12px] bg-white">
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
            <View className="mb-4 flex-row px-4 items-center justify-between">
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(index)}
                  className={`mr-4 ${index === selectedDay ? 'border-b-2 border-[#1483FD]' : ''}`}>
                  <Text className={`text-base ${index === selectedDay ? 'text-[#1483FD]' : 'text-gray-400'}`}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-col">
              {/* 左侧标签 */}
              <View className="mr-4 border-b border-[#0000000D] items-center">
                <View className="flex flex-row justify-between gap-2 pt-2 pb-4">
                  <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                    {[...'个人成就计划'].map((char, index) => (
                      <Text key={index} className="text-[16px]   font-bold">
                        {char}
                      </Text>
                    ))}
                  </View>
                  <View className="flex flex-1 flex-col gap-2">
                    <View className="relative min-h-[200px] rounded-lg bg-[#F5F8FF]">
                      <TextInput
                        className="p-3 flex-1 text-[14px]"
                        placeholderTextColor="#9CA3AF"
                        placeholder="请输入今天的个人成就计划..."
                        multiline
                        textAlignVertical="top"
                        value={dailyPlans[selectedDay].achievementPlan}
                        onChangeText={(text) => {
                          if (text.length <= 300) {
                            updateDailyPlan('achievementPlan', text);
                          }
                        }}
                        maxLength={300}
                      />
                      <View className="absolute bottom-2 right-3">
                        <Text>
                          <Text className="text-[14px] text-black">{dailyPlans[selectedDay].achievementPlan.length}</Text>
                          <Text className="text-[14px] text-[rgba(0,0,0,0.5)]">/300</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mr-4 items-center">
                <View className="flex flex-row justify-between gap-2 pt-4 ">
                  <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                    {[...'完成情况'].map((char, index) => (
                      <Text key={index} className="text-[16px]   font-bold">
                        {char}
                      </Text>
                    ))}
                  </View>
                  <View className="flex flex-1 flex-col gap-2">
                    <View className="relative  min-h-[200px] rounded-lg bg-[#F5F8FF]">
                      <TextInput
                        className="flex-1 p-3 pl-[12px] text-[14px]"
                        placeholderTextColor="#9CA3AF"
                        placeholder="请输入..."
                        multiline
                        textAlignVertical="top"
                        value={dailyPlans[selectedDay].completion}
                        onChangeText={(text) => {
                          if (text.length <= 300) {
                            updateDailyPlan('completion', text);
                          }
                        }}
                        maxLength={300}
                      />
                      <View className="absolute bottom-2 right-3">
                        <Text>
                          <Text className="text-[14px] text-black">{dailyPlans[selectedDay].completion.length}</Text>
                          <Text className="text-[14px] text-[rgba(0,0,0,0.5)]">/300</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 第1周总结 */}
      <View className="mb-4 overflow-hidden rounded-[12px] bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px] justify-center px-4">
          <Text className="font-bold text-[16px] text-white">第{currentDeclaration.weekNumber}周总结</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 进度条 */}
          <View className="mb-4 flex-col   ">
            <Text className="text-[16px] font-bold">本周达成:</Text>
            <View className='flex-row items-center justify-between'>
              <View className="ml-2 mr-4 h-[6px]  w-[80%] rounded-[9.5px] bg-[#D9D9D9] overflow-hidden">
                <LinearGradient
                  colors={['#FF9F21', '#15FF00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className='h-full'
                  style={{
                    width: `${currentDeclaration.averageCompletionRate}%`,
                    borderRadius: 2.5,
                  }}
                />
              </View>
              <Text className="text-[20px] font-bold text-[#FF9F21]">{currentDeclaration.averageCompletionRate}%</Text>
            </View>
          </View>

          <View className="mb-4 flex-col gap-2">
            <Text className="text-[14px]">达成成果:</Text>
            <View className="flex-1">
              <TextInput
                className="min-h-[100px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                value={currentDeclaration.achievement}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, achievement: text } : null
                  );
                }}
              />
            </View>
          </View>

          <View className="mb-4 gap-2">
            <Text className="text-[16px] font-bold">从本周成果和行动出发自我总结:</Text>
            <View className="relative">
              <TextInput
                className="min-h-[200px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                maxLength={300}
                value={currentDeclaration.selfSummary}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, selfSummary: text } : null
                  );
                }}
              />
              <Text className="absolute bottom-2 right-3 text-[14px]">
                <Text className="text-black">{currentDeclaration.selfSummary?.length || 0}</Text>
                <Text className="text-[rgba(0,0,0,0.5)]">/300</Text>
              </Text>
            </View>
          </View>

          <View className="mb-4 gap-2">
            <Text className="text-[14px]">123、4+5+6本周我运用了哪些？特别有体验的是哪条，为什么？</Text>
            <View className="relative">
              <TextInput
                className="min-h-[200px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                maxLength={300}
                value={currentDeclaration.summary123456}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, summary123456: text } : null
                  );
                }}
              />
              <Text className="absolute bottom-2 right-3 text-[14px]">
                <Text className="text-black">{currentDeclaration.summary123456?.length || 0}</Text>
                <Text className="text-[rgba(0,0,0,0.5)]">/300</Text>
              </Text>
            </View>
          </View>

          <View className="mb-4 gap-2">
            <Text className="text-[14px]">我的下一步:</Text>
            <View className="relative">
              <TextInput
                className="min-h-[200px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                maxLength={300}
                value={currentDeclaration.nextStep}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, nextStep: text } : null
                  );
                }}
              />
              <Text className="absolute bottom-2 right-3 text-[14px]">
                <Text className="text-black">{currentDeclaration.nextStep?.length || 0}</Text>
                <Text className="text-[rgba(0,0,0,0.5)]">/300</Text>
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center gap-2 ">
              <Text className="w-[80px] text-[14px]">本周打分:</Text>
              <TextInput
                className="flex-1 h-[36px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={currentDeclaration.weekScore}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, weekScore: text } : null
                  );
                }}
              />
            </View>

            <View className="flex-row items-center gap-2 ">
              <Text className="w-[80px] text-[14px]">本周体验:</Text>
              <TextInput
                className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={currentDeclaration.weekExperience}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, weekExperience: text } : null
                  );
                }}
              />
            </View>

            <View className="flex-row items-center gap-2 ">
              <Text className="w-[80px] text-[14px]">行 得 通:</Text>
              <TextInput
                className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={currentDeclaration.whatWorked}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, whatWorked: text } : null
                  );
                }}
              />
            </View>

            <View className="flex-row items-center gap-2 ">
              <Text className="w-[80px] text-[14px]">学 习 到:</Text>
              <TextInput
                className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={currentDeclaration.whatLearned}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, whatLearned: text } : null
                  );
                }}
              />
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="w-[80px] text-[14px]">下 一 步:</Text>
              <TextInput
                className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={currentDeclaration.whatNext}
                onChangeText={(text) => {
                  setCurrentDeclaration((prev) =>
                    prev ? { ...prev, whatNext: text } : null
                  );
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
