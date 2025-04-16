import { View, Text, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import { useUpdateWeeklyDeclaration } from '~/queries/weeklyDeclaration';

cssInterop(LinearGradient, { className: 'style' });

interface WeeklyDeclarationItemProps {
  declaration: WeeklyDeclarationDTO;
  onUpdateDeclaration: (updatedDeclaration: WeeklyDeclarationDTO) => void;
  readOnly?: boolean;
}

export default function WeeklyDeclarationItem({ declaration, onUpdateDeclaration, readOnly = false }: WeeklyDeclarationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [localDeclaration, setLocalDeclaration] = useState(declaration);
  const updateMutation = useUpdateWeeklyDeclaration();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // 当declaration属性改变时，更新本地状态
  useEffect(() => {
    setLocalDeclaration(declaration);
  }, [declaration]);

  // 自动保存函数
  const autoSave = async () => {
    if (readOnly || !localDeclaration.id) return;
    
    try {
      await updateMutation.mutateAsync({
        id: localDeclaration.id.toString(),
        declaration: localDeclaration
      });
    } catch (error) {
      console.error('保存周宣告失败:', error);
    }
  };

  // 设置防抖保存
  const debouncedSave = () => {
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 设置新的定时器，3秒后保存
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const updateDailyPlan = (type: 'achievementPlan' | 'completion', text: string) => {
    if (readOnly) return;
    
    setDailyPlans(prev => {
      const newPlans = [...prev];
      newPlans[selectedDay] = {
        ...newPlans[selectedDay],
        [type]: text
      };
      return newPlans;
    });
  };

  const handleTextChange = (field: keyof WeeklyDeclarationDTO, value: string, maxLength?: number) => {
    if (readOnly) return;
    if (maxLength && value.length > maxLength) return;

    // 更新本地状态
    setLocalDeclaration(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 通知父组件
    onUpdateDeclaration({
      ...localDeclaration,
      [field]: value
    });
    
    // 触发防抖保存
    debouncedSave();
  };

  const updateWeeklyGoal = (index: number, value: string) => {
    if (readOnly) return;
    
    const numericValue = value.replace(/[^0-9]/g, '');
    const updatedGoals = [...localDeclaration.weeklyGoals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      completedQuantity: parseInt(numericValue) || 0
    };

    // 更新本地状态
    const updatedDeclaration = {
      ...localDeclaration,
      weeklyGoals: updatedGoals
    };
    
    setLocalDeclaration(updatedDeclaration);
    
    // 通知父组件
    onUpdateDeclaration(updatedDeclaration);
    
    // 触发防抖保存
    debouncedSave();
  };

  return (
    <View className="flex-col">
      <View className="mb-4 flex-row items-center justify-center">
        <View className="flex-row items-center">
          <Text className="text-[16px] font-bold text-black">
            第
          </Text>
          <Text className="text-[20px] font-bold text-[#F18318]">
            {localDeclaration.weekNumber}
          </Text>
          <Text className="text-[16px] mr-4 font-bold text-black">
            周宣告
          </Text>
          <Text className="text-[16px] font-bold text-[#1483FD]">
            {localDeclaration.title || '未设置标题'}
          </Text>
        </View>
        {!readOnly && (
          <View className="flex-row items-center">
            {updateMutation.isPending && (
              <Text className="text-xs text-gray-500 mr-2">保存中...</Text>
            )}
            <Pressable className="ml-2 flex-row items-center justify-center">
              <Ionicons name="create-outline" size={16} color="#1483fd" />
            </Pressable>
          </View>
        )}
      </View>

      <View className={`flex-col ${isExpanded ? '' : ' bg-white rounded-b-[12px]'}`}>
        {/* 成果宣告 */}
        <View style={{ overflow: 'visible' }} className="mb-4 rounded-b-[12px] bg-white">
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
              className={`flex ${isExpanded ? 'rounded-t-[12px]' : 'rounded-[12px]'} h-[38px] flex-row items-center justify-between px-4`}>
              <View className="flex-row items-center">
                <Text className="font-bold text-[16px] text-white">成果宣告</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <Text className="text-[16px] text-white mr-2">
                  {new Date(localDeclaration.weekStartDate).getFullYear()}年
                  {new Date(localDeclaration.weekStartDate).getMonth() + 1}月
                  {new Date(localDeclaration.weekStartDate).getDate()}日
                </Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#fff"
                />
              </View>
            </LinearGradient>
          </Pressable>
          <View className={`px-4 mt-8 ${isExpanded ? 'block' : 'hidden'}`}>
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
              value={localDeclaration.declarationContent}
              onChangeText={(text) => handleTextChange('declarationContent', text, 150)}
              maxLength={150}
              editable={!readOnly}
            />

            {/* 本周目标标题 */}
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 w-1 h-7 bg-[#1483FD]" />
              <Text className="text-[16px] font-bold">本周目标</Text>
            </View>

            {/* 目标列表 */}
            {localDeclaration.weeklyGoals.map((goal, index) => (
              <View key={goal.goalId || index} className="mb-4 gap-2 flex-row items-center justify-between">
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
                      value={goal.completedQuantity.toString()}
                      onChangeText={(text) => updateWeeklyGoal(index, text)}
                      editable={!readOnly}
                    />
                  </View>
                  <Text className="pl-7 flex-1 text-[14px] text-[#00000080]">
                    {goal.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 行动计划 */}
        <View className={`mb-4 overflow-hidden rounded-[12px] bg-white ${isExpanded ? 'block' : 'hidden'}`}>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}
            className="flex h-[38px] justify-center px-4">
            <Text className="font-bold text-[16px] text-white">行动计划</Text>
          </LinearGradient>
          <View className="p-4">
            {/* 星期选择器 */}
            <View className="mb-4 flex-row px-4 items-center justify-between">
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(index)}
                  disabled={readOnly}
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
                      <Text key={index} className="text-[16px] font-bold">
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
                        editable={!readOnly}
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
                <View className="flex flex-row justify-between gap-2 pt-4">
                  <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                    {[...'完成情况'].map((char, index) => (
                      <Text key={index} className="text-[16px] font-bold">
                        {char}
                      </Text>
                    ))}
                  </View>
                  <View className="flex flex-1 flex-col gap-2">
                    <View className="relative min-h-[200px] rounded-lg bg-[#F5F8FF]">
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
                        editable={!readOnly}
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

        {/* 周总结 */}
        <View className="mb-4 overflow-hidden rounded-[12px] bg-white">
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}
            className={`flex h-[38px] justify-center px-4 ${isExpanded ? '' : 'hidden'}`}>
            <Text className="font-bold text-[16px] text-white">第{localDeclaration.weekNumber}周总结</Text>
          </LinearGradient>
          <View className="p-4">
            {/* 进度条 */}
            <View className={`${isExpanded ? 'mb-4' : ''} flex-col`}>
              <Text className="text-[16px] font-[600]">本周达成:</Text>
              <View className='flex-row items-center justify-between'>
                <View className="mr-4 h-[6px] w-[82%] rounded-[9.5px] bg-[#D9D9D9] overflow-hidden">
                  <LinearGradient
                    colors={['#FF9F21', '#15FF00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className='h-full'
                    style={{
                      width: `${localDeclaration.averageCompletionRate}%`,
                      borderRadius: 2.5,
                    }}
                  />
                </View>
                <Text className="text-[20px] text-center w-[16%] font-bold text-[#FF9F21]">
                  {localDeclaration.averageCompletionRate}%
                </Text>
              </View>
            </View>

            {/* 以下内容在收起时隐藏 */}
            <View className={`${isExpanded ? 'block' : 'hidden'}`}>
              <View className="mb-4 flex-col gap-2">
                <Text className="text-[14px]">达成成果:</Text>
                <View className="flex-1">
                  <TextInput
                    className="min-h-[100px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.achievement}
                    onChangeText={(text) => handleTextChange('achievement', text)}
                    editable={!readOnly}
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
                    value={localDeclaration.selfSummary}
                    onChangeText={(text) => handleTextChange('selfSummary', text, 300)}
                    editable={!readOnly}
                  />
                  <Text className="absolute bottom-2 right-3 text-[14px]">
                    <Text className="text-black">{localDeclaration.selfSummary?.length || 0}</Text>
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
                    value={localDeclaration.summary123456}
                    onChangeText={(text) => handleTextChange('summary123456', text, 300)}
                    editable={!readOnly}
                  />
                  <Text className="absolute bottom-2 right-3 text-[14px]">
                    <Text className="text-black">{localDeclaration.summary123456?.length || 0}</Text>
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
                    value={localDeclaration.nextStep}
                    onChangeText={(text) => handleTextChange('nextStep', text, 300)}
                    editable={!readOnly}
                  />
                  <Text className="absolute bottom-2 right-3 text-[14px]">
                    <Text className="text-black">{localDeclaration.nextStep?.length || 0}</Text>
                    <Text className="text-[rgba(0,0,0,0.5)]">/300</Text>
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">本周打分:</Text>
                  <TextInput
                    className="flex-1 h-[36px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={localDeclaration.weekScore}
                    onChangeText={(text) => handleTextChange('weekScore', text)}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">本周体验:</Text>
                  <TextInput
                    className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.weekExperience}
                    onChangeText={(text) => handleTextChange('weekExperience', text)}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">行 得 通:</Text>
                  <TextInput
                    className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.whatWorked}
                    onChangeText={(text) => handleTextChange('whatWorked', text)}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">学 习 到:</Text>
                  <TextInput
                    className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.whatLearned}
                    onChangeText={(text) => handleTextChange('whatLearned', text)}
                    editable={!readOnly}
                  />
                </View>
                
                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">下 一 步:</Text>
                  <TextInput
                    className="flex-1 h-[100px] rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.whatNext}
                    onChangeText={(text) => handleTextChange('whatNext', text)}
                    editable={!readOnly}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}