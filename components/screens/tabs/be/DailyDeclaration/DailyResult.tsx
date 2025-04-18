// 导入必要的React Native和第三方组件
import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { dailyDeclarationApi } from '~/api/be/dailyDeclaration';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 定义组件的属性类型接口
type DailyResultProps = {
  goals: Array<{
    goalId?: string;    // 目标ID
    content?: string;  // 目标内容（旧字段）
    title?: string;    // 目标标题
    completedQuantity?: number; // 完成数量
    unit?: string;    // 可选的单位（如：个、次、份等）
    weeklyProgress?: string;   // 每个目标的周进度
    totalProgress?: string;  // 每个目标的月进度
  }>;
  showHeader?: boolean;     // 是否显示标题栏
  declarationId?: string;   // 宣告ID
  onUpdate?: () => void;    // 更新回调
};

// 今日成果组件：展示每日目标完成情况和进度
export default function DailyResult({
  goals,
  showHeader = true,
  declarationId,
  onUpdate
}: DailyResultProps) {
  // 编辑状态管理
  const [editingStates, setEditingStates] = useState<{ [key: string]: boolean }>({});
  // 临时内容管理
  const [tempContents, setTempContents] = useState<{ [key: string]: string }>({});
  // 加载状态管理
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // 开始编辑
  const startEditing = (index: number, content: string) => {
    setEditingStates(prev => ({ ...prev, [index]: true }));
    setTempContents(prev => ({ ...prev, [index]: content }));
  };

  // 保存编辑
  const saveEditing = async (index: number) => {
    if (!declarationId) return;

    const content = tempContents[index];
    const unit = goals[index]?.unit || '';

    try {
      setLoadingStates(prev => ({ ...prev, [index]: true }));

      // 构建目标数组
      const updatedGoals = [...goals.map((goal, i) => ({
        goalId: goal.goalId,
        title: goal.title || goal.content || '',
        unit: goal.unit,
        completedQuantity: i === index ? Number(content) || 0 : (goal.completedQuantity || 0)
      }))];

      // 更新目标
      await dailyDeclarationApi.updateNewDailyDeclaration(declarationId, {
        dailyGoals: updatedGoals
      } as any);

      // 更新成功后清除编辑状态
      setEditingStates(prev => ({ ...prev, [index]: false }));
      // 只在明确需要刷新整个列表时才触发onUpdate回调
      // if (onUpdate) {
      //   onUpdate();
      // }
    } catch (error) {
      console.log('更新失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  // 取消编辑
  const cancelEditing = (index: number) => {
    setEditingStates(prev => ({ ...prev, [index]: false }));
    setTempContents(prev => ({ ...prev, [index]: '' }));
  };

  // 处理文本输入变更
  const handleTextChange = (index: number, text: string) => {
    setTempContents(prev => ({ ...prev, [index]: text }));
  };

  // 处理失去焦点保存
  const handleBlur = (index: number) => {
    saveEditing(index);
  };

  return (
    <View className="overflow-hidden rounded-b-xl bg-white">
      {/* 头部渐变标题栏 */}
      {showHeader && (
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex h-[38px] flex-col items-start justify-center rounded-t-xl px-4"
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}>
          <Text
            className="text-white"
            style={{
              fontFamily: 'Roboto',
              fontSize: 16,
              fontWeight: '700',
              lineHeight: 20,
            }}>
            今日成果
          </Text>
        </LinearGradient>
      )}

      <View className="p-4">
        {/* 今日完成的目标列表 */}
        {showHeader && (
          <View>
            <View className="mb-2 flex flex-row items-center">
              <View className="mr-2 h-8 w-1 rounded-full bg-[#1483FD]" />
              <Text className=" text-[16px] font-[700] text-black">今日完成</Text>
            </View>
            <View>
              {goals.map((goal, index) => {
                const isLoading = loadingStates[index];
                const goalText = goal.title || goal.content || '';

                return (
                  <View key={index} className="relative mb-4 overflow-hidden rounded-[6px]">
                    <View className="flex-col">
                      <View className="flex-row items-center mb-1">
                        <Text className="ml-1 text-[14px] font-medium text-gray-700">
                          {goalText || `目标${index + 1}`} {goal.unit ? `(${goal.unit})` : ''}：
                        </Text>
                      </View>
                      <View className="relative">
                        <BlurView intensity={10} className="absolute h-full w-full bg-[#1483FD0D]" />
                        <TextInput
                          className="z-10 min-h-[47px] w-full p-3 text-gray-600"
                          placeholder={`请输入...`}
                          multiline
                          value={tempContents[index] || String(goal.completedQuantity || '')}
                          onChangeText={(text) => handleTextChange(index, text)}
                          onBlur={() => handleBlur(index)}
                          blurOnSubmit={true}
                          editable={declarationId !== undefined}
                          keyboardType="numeric"
                        />
                        {/* 加载中指示器 */}
                        {loadingStates[index] && (
                          <Text
                            style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              color: '#40CA00',
                              fontSize: 12,
                            }}>
                            保存中...
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 今日进度展示区域 */}
        {showHeader ? (
          // 展开状态：显示完整的进度展示区域
          <View className="mt-6 flex-col justify-between gap-2">
            <View className="mb-2 flex flex-row items-center">
              <View className="mr-2 h-8 w-1 rounded-full bg-[#1483FD]" />
              <Text className=" text-[16px] font-[700] text-black">今日进度</Text>
            </View>
            <View>
              {goals.map((goal, index) => (
                <View key={index} className="relative mb-4 overflow-hidden rounded-[6px]">
                  <View className="flex-col">
                    <Text className="ml-1 text-[14px] font-[600] text-gray-700">
                      {goal.title || `目标${index + 1}`}{goal.unit ? ` (${goal.unit})` : ''}:
                    </Text>
                    {/* 进度指标展示 */}
                    <View className="flex flex-row gap-2 items-center">
                      <View className="flex-1 items-center">
                        <Text
                          className="mb-2"
                          style={{
                            color: 'rgba(0, 0, 0, 0.50)',
                            fontSize: 14,
                            fontWeight: '400',
                          }}>
                          周累计达成数/周目标数
                        </Text>
                        {/* 周度进度显示框 */}
                        <View className="flex h-[70px] w-full items-center justify-center overflow-hidden rounded-[6px]">
                          <View
                            className="absolute left-0 top-[10px] h-[30px] w-[30px] rounded-full opacity-100"
                            style={{
                              backgroundColor: '#1483FD',
                              filter: 'blur(25px)',
                            }}
                          />
                          <BlurView
                            intensity={10}
                            className="absolute h-full w-full bg-[#1483FD0D]"
                          />
                          <Text
                            style={{
                              color: '#1483FD',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '700',
                              zIndex: 1,
                            }}>
                            {goal.weeklyProgress?.split('/')[0] || '0'}
                            <Text
                              style={{
                                color: '#00000080',
                                fontFamily: 'Roboto',
                                fontSize: 14,
                                fontWeight: '400',
                              }}>
                              /
                            </Text>
                            <Text
                              style={{
                                color: '#000000',
                                fontFamily: 'Roboto',
                                fontSize: 14,
                                fontWeight: '400',
                              }}>
                              {goal.weeklyProgress?.split('/')[1] || '0'}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 items-center">
                        <Text
                          className="mb-2"
                          style={{
                            color: 'rgba(0, 0, 0, 0.50)',
                            fontFamily: 'Roboto',
                            fontSize: 14,
                            fontWeight: '400',
                          }}>
                          累计达成数/总目标数
                        </Text>
                        {/* 月度进度显示框 */}
                        <View className="flex h-[70px] w-full items-center justify-center overflow-hidden rounded-[6px]">
                          <View
                            className="absolute left-0 top-[10px] h-[30px] w-[30px] rounded-full opacity-100"
                            style={{
                              backgroundColor: '#1483FD',
                              filter: 'blur(25px)',
                            }}
                          />
                          <BlurView
                            intensity={10}
                            className="absolute h-full w-full bg-[#1483FD0D]"
                          />
                          <Text
                            style={{
                              color: '#1483FD',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '700',
                              zIndex: 1,
                            }}>
                            {goal.totalProgress?.split('/')[0] || '0'}
                            <Text
                              style={{
                                color: '#00000080',
                                fontFamily: 'Roboto',
                                fontSize: 14,
                                fontWeight: '400',
                              }}>
                              /
                            </Text>
                            <Text
                              style={{
                                color: '#000000',
                                fontFamily: 'Roboto',
                                fontSize: 14,
                                fontWeight: '400',
                              }}>
                              {goal.totalProgress?.split('/')[1] || '0'}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          // 收起状态：只显示进度指标展示部分的 goals.map
          <View>
            {goals.map((goal, index) => (
              <View key={index} className="mb-4">
                <View className="flex-col">
                  {/* 目标标题和单位 */}
                  <Text className="ml-1 mb-2 text-[14px] font-[600] text-gray-700">
                    {goal.title || `目标${index + 1}`}{goal.unit ? ` (${goal.unit})` : ''}
                  </Text>
                  {/* 进度指标展示 */}
                  <View className="flex flex-row gap-2 items-center">
                    <View className="flex-1 items-center">

                      {/* 周度进度显示框 */}
                      <View className="flex h-[70px] w-full border border-[#0000001A] items-center justify-center overflow-hidden rounded-[6px]">
                        <Text
                          className="mb-2"
                          style={{
                            color: '#00000080',
                            fontSize: 14,
                            fontWeight: '400',
                          }}>
                          周累计达成数
                          <Text
                            style={{
                              color: '#00000080',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            /
                          </Text>
                          周目标数
                        </Text>


                        <Text
                          style={{
                            color: '#00000080',
                            fontFamily: 'Roboto',
                            fontSize: 14,
                            fontWeight: '700',
                            zIndex: 1,
                          }}>
                          {goal.weeklyProgress?.split('/')[0] || '0'}
                          <Text
                            style={{
                              color: '#00000080',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            /
                          </Text>
                          <Text
                            style={{
                              color: '#1483FD',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            {goal.weeklyProgress?.split('/')[1] || '0'}
                          </Text>
                        </Text>

                      </View>
                    </View>
                    <View className="flex-1 items-center">

                      {/* 月度进度显示框 */}
                      <View className="flex h-[70px] border border-[#0000001A]  w-full items-center justify-center overflow-hidden rounded-[6px]">
                        <Text
                          className="mb-2"
                          style={{
                            color: '#00000080',
                            fontSize: 14,
                            fontWeight: '400',
                          }}>
                          累计达成数
                          <Text
                            style={{
                              color: '#00000080',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            /
                          </Text>
                          总目标数
                        </Text>

                        <Text
                          style={{
                            color: '#00000080',
                            fontFamily: 'Roboto',
                            fontSize: 14,
                            fontWeight: '700',
                            zIndex: 1,
                          }}>
                          {goal.totalProgress?.split('/')[0] || '0'}
                          <Text
                            style={{
                              color: '#00000080',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            /
                          </Text>
                          <Text
                            style={{
                              color: '#1483FD',
                              fontFamily: 'Roboto',
                              fontSize: 14,
                              fontWeight: '400',
                            }}>
                            {goal.totalProgress?.split('/')[1] || '0'}
                          </Text>
                        </Text>

                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}