import { View, Text, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import { useUpdateWeeklyDeclaration } from '~/queries/weeklyDeclaration';
import { Image } from 'react-native';
import saveIcon from '~/assets/saveIcon.png';
cssInterop(LinearGradient, { className: 'style' });
cssInterop(Image, { className: 'style' });
interface WeeklyDeclarationItemProps {
  declaration: WeeklyDeclarationDTO;
  onUpdateDeclaration: (updatedDeclaration: WeeklyDeclarationDTO) => void;
  readOnly?: boolean;
}

export default function WeeklyDeclarationItem({
  declaration,
  onUpdateDeclaration,
  readOnly = false,
}: WeeklyDeclarationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [localDeclaration, setLocalDeclaration] = useState(declaration);
  const updateMutation = useUpdateWeeklyDeclaration();
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // 当declaration属性改变时，更新本地状态
  useEffect(() => {
    setLocalDeclaration(declaration);
    console.log('declaration', new Date().toISOString(), declaration);
  }, [declaration]);

  // 失去焦点时保存函数
  const handleBlur = async () => {
    if (readOnly || !localDeclaration.id) return;
    console.log('handleBlur', new Date().toISOString());
    try {
      await updateMutation.mutateAsync({
        id: localDeclaration.id.toString(),
        declaration: localDeclaration,
      });
    } catch (error) {
      console.log('保存周宣告失败:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 打开标题编辑模态框
  const openTitleModal = () => {
    setTempTitle(localDeclaration.title || '');
    setTitleModalVisible(true);
  };

  // 保存标题
  const saveTitle = () => {
    handleTextChange('title', tempTitle);
    updateMutation.mutateAsync({
      id: localDeclaration.id.toString(),
      declaration: {
        ...localDeclaration,
        title: tempTitle,
      },
    });
    setTitleModalVisible(false);
  };

  // 添加修改周目标的函数
  const updateWeeklyGoal = (index: number, text: string) => {
    if (readOnly) return;

    const numericValue = text.trim() === '' ? 0 : parseFloat(text);
    console.log('numericValue', numericValue);
    if (isNaN(numericValue)) return;

    const updatedGoals = [...localDeclaration.weeklyGoals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      targetQuantity: numericValue,
    };

    setLocalDeclaration((prev) => {
      return {
        ...prev,
        weeklyGoals: updatedGoals,
      };
    });

    onUpdateDeclaration({
      ...localDeclaration,
      weeklyGoals: updatedGoals,
    });
  };

  // 修改 handleTextChange，移除防抖保存
  const handleTextChange = (
    field: keyof WeeklyDeclarationDTO,
    value: string,
    maxLength?: number
  ) => {
    if (readOnly) return;
    if (maxLength && value.length > maxLength) return;

    setLocalDeclaration((prev) => ({
      ...prev,
      [field]: value,
    }));

    onUpdateDeclaration({
      ...localDeclaration,
      [field]: value,
    });
  };

  return (
    <View className="relative flex-col">
      {/* 添加悬浮保存按钮 */}

      <View className="mb-4 flex-row items-center justify-center">
        <View className="flex-row items-center">
          <Text className="text-[16px] font-bold text-black">第</Text>
          <Text className="text-[20px] font-bold text-[#F18318]">
            {localDeclaration.weekNumber}
          </Text>
          <Text className="mr-4 text-[16px] font-bold text-black">周宣告</Text>
          <Text className="text-[16px] font-bold text-[#1483FD]">
            {localDeclaration.title || '未设置标题'}
          </Text>
        </View>
        {!readOnly && (
          <View className="flex-row items-center">
            {updateMutation.isPending && (
              <Text className="mr-2 text-xs text-gray-500">保存中...</Text>
            )}
            <Pressable
              className="ml-2 flex-row items-center justify-center"
              onPress={openTitleModal}>
              <Ionicons name="create-outline" size={16} color="#1483fd" />
            </Pressable>
          </View>
        )}
      </View>

      {/* 标题编辑模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={titleModalVisible}
        onRequestClose={() => setTitleModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-[#00000080]">
          <View className="w-[80%] rounded-lg bg-white p-6 shadow-lg">
            <Text className="mb-4 text-[18px] font-bold">编辑标题</Text>
            <TextInput
              className="mb-4 rounded-lg border border-[#1483FD33] p-3"
              placeholder="请输入标题"
              value={tempTitle}
              onChangeText={setTempTitle}
              maxLength={30}
            />
            <View className="flex-row justify-end">
              <Pressable className="mr-2 px-4 py-2" onPress={() => setTitleModalVisible(false)}>
                <Text className="text-[#666666]">取消</Text>
              </Pressable>
              <Pressable className="rounded-lg bg-[#1483FD] px-4 py-2" onPress={saveTitle}>
                <Text className="text-white">确定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View className={`flex-col ${isExpanded ? '' : ' rounded-b-[12px] bg-white'}`}>
        {/* 成果宣告 */}
        <View style={{ overflow: 'visible' }} className="mb-4 rounded-b-[12px] bg-white">
          <Pressable
            onPress={toggleExpand}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
              }}
              className={`flex ${isExpanded ? 'rounded-t-[12px]' : 'rounded-[12px]'} h-[38px] flex-row items-center justify-between px-4`}>
              <View className="flex-row items-center">
                <Text className="text-[16px] font-bold text-white">成果宣告</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <Text className="mr-2 text-[16px] text-white">
                  {new Date(localDeclaration.weekStartDate).getFullYear()}年
                  {new Date(localDeclaration.weekStartDate).getMonth() + 1}月
                  {new Date(localDeclaration.weekStartDate).getDate()}日
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#fff"
                />
              </View>
            </LinearGradient>
          </Pressable>
          <View className={`mt-8 px-4 ${isExpanded ? 'block' : 'hidden'}`}>
            {/* 本周宣告标题 */}
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
              <Text className="text-[16px] font-bold">本周宣告</Text>
            </View>

            {/* 宣告内容输入框 */}
            <TextInput
              className="mb-4 min-h-[60px] rounded-lg bg-[#1483FD1A] p-4 text-[14px]"
              placeholder="请输入宣告成果"
              multiline
              value={localDeclaration.declarationContent}
              onChangeText={(text) => handleTextChange('declarationContent', text, 150)}
              onBlur={handleBlur}
              maxLength={150}
              editable={!readOnly}
            />

            {/* 本周目标标题 */}
            <View className="mb-4 flex-row items-center">
              <View className="mr-2 h-7 w-1 bg-[#1483FD]" />
              <Text className="text-[16px] font-bold">本周目标</Text>
            </View>

            {/* 目标列表 */}
            {localDeclaration.weeklyGoals.map((goal, index) => (
              <View
                key={goal.goalId || index}
                className="mb-4 flex-row items-center justify-between gap-2">
                <Text className="text-[14px] font-[600]">目标{index + 1} :</Text>
                <View className="ml-2 flex-1 flex-row items-center">
                  <View className="w-[70%]">
                    <TextInput
                      className="h-[36px] rounded-lg bg-[#1483FD0D] px-3"
                      placeholder="请输入数量"
                      keyboardType="numeric"
                      maxLength={10}
                      value={goal.targetQuantity.toString()}
                      onChangeText={(text) => updateWeeklyGoal(index, text)}
                      onBlur={handleBlur}
                      editable={!readOnly}
                    />
                  </View>
                  <Text className="flex-1 pl-7 text-[14px] text-[#00000080]">{goal.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 行动计划 */}
        <View
          className={`mb-4 overflow-hidden rounded-[12px] bg-white ${isExpanded ? 'block' : 'hidden'}`}>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}
            className="flex h-[38px] justify-center px-4">
            <Text className="text-[16px] font-bold text-white">行动计划</Text>
          </LinearGradient>
          <View className="p-4">
            {/* 星期选择器 */}
            <View className="mb-4 flex-row items-center justify-between px-4">
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(index)}
                  className={`mr-4 ${index === selectedDay ? 'border-b-2 border-[#1483FD]' : ''}`}>
                  <Text
                    className={`text-base ${index === selectedDay ? 'text-[#1483FD]' : 'text-gray-400'}`}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-col">
              {/* 日计划内容 */}
              <View className="border-b border-[#0000000D] pb-4">
                <Text className="mb-3 text-[16px] font-bold">每日计划</Text>

                {/* 上午计划 */}
                <View className="mb-3 flex-row">
                  <View className="w-[80px] flex-row items-center">
                    <View className="mr-2 h-5 w-1 bg-[#1483FD]" />
                    <Text className="text-[14px] font-bold">上午</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-[#F5F8FF] p-3">
                    <Text className="text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.morningPlan || '暂无计划'}
                    </Text>
                  </View>
                </View>

                {/* 中午计划 */}
                <View className="mb-3 flex-row">
                  <View className="w-[80px] flex-row items-center">
                    <View className="mr-2 h-5 w-1 bg-[#1483FD]" />
                    <Text className="text-[14px] font-bold">中午</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-[#F5F8FF] p-3">
                    <Text className="text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.noonPlan || '暂无计划'}
                    </Text>
                  </View>
                </View>

                {/* 下午计划 */}
                <View className="mb-3 flex-row">
                  <View className="w-[80px] flex-row items-center">
                    <View className="mr-2 h-5 w-1 bg-[#1483FD]" />
                    <Text className="text-[14px] font-bold">下午</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-[#F5F8FF] p-3">
                    <Text className="text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.afternoonPlan ||
                        '暂无计划'}
                    </Text>
                  </View>
                </View>

                {/* 晚上计划 */}
                <View className="flex-row">
                  <View className="w-[80px] flex-row items-center">
                    <View className="mr-2 h-5 w-1 bg-[#1483FD]" />
                    <Text className="text-[14px] font-bold">晚上</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-[#F5F8FF] p-3">
                    <Text className="text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.eveningPlan || '暂无计划'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 日完成情况 */}
              <View className="mt-4">
                <Text className="mb-3 text-[16px] font-bold">日完成情况</Text>
                <View className="rounded-lg bg-[#F5F8FF] p-4">
                  <View className="mb-2 flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">日评分:</Text>
                    <Text className="text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.dayScore || '-'}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">日体验:</Text>
                    <Text className="flex-1 text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.dayExperience || '-'}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">行得通:</Text>
                    <Text className="flex-1 text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.whatWorked || '-'}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">行不通:</Text>
                    <Text className="flex-1 text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.whatDidntWork || '-'}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">学习到:</Text>
                    <Text className="flex-1 text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.whatLearned || '-'}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-[100px] text-[14px] font-bold">下一步:</Text>
                    <Text className="flex-1 text-[14px]">
                      {localDeclaration.dailyDeclarations?.[selectedDay]?.whatNext || '-'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 日目标完成情况 */}
              {localDeclaration.dailyDeclarations?.[selectedDay]?.dailyGoals &&
                localDeclaration.dailyDeclarations[selectedDay].dailyGoals.length > 0 && (
                  <View className="mt-4">
                    <Text className="mb-3 text-[16px] font-bold">周目标完成情况</Text>
                    {localDeclaration.weeklyGoals.map(
                      (goal, index) => (
                        <View
                          key={goal.goalId || index}
                          className="mb-2 rounded-lg bg-[#F5F8FF] p-3">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-bold">{goal.title || ''}:</Text>
                            <View className="flex-row items-center">
                              <Text className="text-[14px]">
                                {goal.completedQuantity || 0} / {goal.targetQuantity || 0}{' '}
                                {goal.unit || ''}
                              </Text>
                              <Text className="ml-2 text-[14px] text-[#1483FD]">
                                ({(goal.completionRate || 0).toFixed(1)}%)
                              </Text>
                            </View>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                )}
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
            <Text className="text-[16px] font-bold text-white">
              第{localDeclaration.weekNumber}周总结
            </Text>
          </LinearGradient>
          <View className="p-4">
            {/* 进度条 */}
            <View className={`${isExpanded ? 'mb-4' : ''} flex-col`}>
              <Text className="text-[16px] font-[600]">本周达成:</Text>
              <View className="flex-row items-center justify-between">
                <View className="mr-4 h-[6px] w-[82%] overflow-hidden rounded-[9.5px] bg-[#D9D9D9]">
                  <LinearGradient
                    colors={['#FF9F21', '#15FF00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full"
                    style={{
                      width: `${Math.min(localDeclaration.averageCompletionRate, 100)}%`,
                      borderRadius: 2.5,
                    }}
                  />
                </View>
                <Text className="w-[16%] text-center text-[20px] font-bold text-[#FF9F21]">
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
                    textAlignVertical="top"
                    value={localDeclaration.achievement}
                    onChangeText={(text) => handleTextChange('achievement', text)}
                    onBlur={handleBlur}
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
                    textAlignVertical="top"
                    value={localDeclaration.selfSummary}
                    onChangeText={(text) => handleTextChange('selfSummary', text, 300)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                  <Text className="absolute bottom-2 right-3 text-[14px]">
                    <Text className="text-black">{localDeclaration.selfSummary?.length || 0}</Text>
                    <Text className="text-[rgba(0,0,0,0.5)]">/300</Text>
                  </Text>
                </View>
              </View>

              <View className="mb-4 gap-2">
                <Text className="text-[14px]">
                  123、4+5+6本周我运用了哪些？特别有体验的是哪条，为什么？
                </Text>
                <View className="relative">
                  <TextInput
                    className="min-h-[200px] rounded-[6px] bg-[#1483FD1A] p-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    maxLength={300}
                    textAlignVertical="top"
                    value={localDeclaration.summary123456}
                    onChangeText={(text) => handleTextChange('summary123456', text, 300)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                  <Text className="absolute bottom-2 right-3 text-[14px]">
                    <Text className="text-black">
                      {localDeclaration.summary123456?.length || 0}
                    </Text>
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
                    textAlignVertical="top"
                    value={localDeclaration.nextStep}
                    onChangeText={(text) => handleTextChange('nextStep', text, 300)}
                    onBlur={handleBlur}
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
                    className="h-[36px] flex-1 rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    textAlignVertical="top"
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={localDeclaration.weekScore}
                    onChangeText={(text) => handleTextChange('weekScore', text)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">本周体验:</Text>
                  <TextInput
                    className="h-[100px] flex-1 rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    textAlignVertical="top"
                    value={localDeclaration.weekExperience}
                    onChangeText={(text) => handleTextChange('weekExperience', text)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">行 得 通:</Text>
                  <TextInput
                    className="h-[100px] flex-1 rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    textAlignVertical="top"
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    value={localDeclaration.whatWorked}
                    onChangeText={(text) => handleTextChange('whatWorked', text)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">学 习 到:</Text>
                  <TextInput
                    className="h-[100px] flex-1 rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    textAlignVertical="top"
                    value={localDeclaration.whatLearned}
                    onChangeText={(text) => handleTextChange('whatLearned', text)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                </View>

                {/* <View className="flex-row items-center gap-2">
                  <Text className="w-[80px] text-[14px]">下 一 步:</Text>
                  <TextInput
                    className="h-[100px] flex-1 rounded-[6px] bg-[#1483FD0D] px-3 text-[14px]"
                    placeholder="请输入..."
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    multiline
                    textAlignVertical="top"
                    value={localDeclaration.whatNext}
                    onChangeText={(text) => handleTextChange('whatNext', text)}
                    onBlur={handleBlur}
                    editable={!readOnly}
                  />
                </View> */}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
