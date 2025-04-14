import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { achievementBookApi } from '~/api/be/achievementBook';
import { request } from '~/utils/request';

// 成就项组件
const AchievementItem = ({
  data,
  onChange,
  onDelete,
  index
}: {
  data: Achievement,
  onChange: (data: Achievement) => void,
  onDelete: () => void,
  index: number
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <View className="mb-4 overflow-hidden rounded-t-xl bg-white">
      {/* 头部渐变标题栏 */}
      <LinearGradient
        colors={['#20B4F3', '#5762FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex h-[38px] flex-row items-center justify-between rounded-t-xl px-4"
        style={{
          boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
        }}>
        <View className="flex-1 flex-row items-center">
          {isEditingTitle ? (
            <TextInput
              className="flex-1 rounded-md bg-white/10 px-2 py-1 text-white"
              value={data.title}
              onChangeText={(text) => onChange({ ...data, title: text })}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              placeholder="请输入标题"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          ) : (
            <Text
              className="text-white"
              style={{
                fontSize: 16,
                fontWeight: '800',
                lineHeight: 20,
              }}>
              {data.title || `成就 ${index + 1}`}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => setIsEditingTitle(true)}
            className="ml-2"
          >
            <AntDesign name="edit" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onDelete}>
          <AntDesign name="delete" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      <View className="mt-6 mb-4">
        {/* 解释文本 */}
        <View className="px-4">
          <Text className="text-[12px] font-bold text-black/50">从下列范畴选择至少三项承诺创造成果，并列明：目的、行动、态度、成果、事业、家庭、人际关系、亲密关系、经济、健康、学习或其它</Text>
          <Text className="mt-3 px-3 text-[12px] font-[400] text-black/50">每个承诺创造的范畴包括以下内容：目的（BE）、态度、行动(DO)、成果（HAVE）</Text>
        </View>
      </View>
      <View className="space-y-4 px-3 py-4">
        {/* 承诺内容 */}
        <View className="rounded-md">
          <Text className="text-sm font-bold text-black">承诺内容：</Text>
          <TextInput
            className="rounded-md bg-[rgba(20,131,253,0.05)] p-3 text-xs text-black/50"
            placeholder="请输入承诺内容"
            value={data.commitment}
            onChangeText={(text) => onChange({ ...data, commitment: text })}
          />
        </View>

        {/* 目的 */}
        <View>
          <Text className="mb-2 text-sm font-bold text-black">目的（Be:为什么做，有什么价值）：</Text>
          <TextInput
            className="rounded-md bg-[rgba(20,131,253,0.05)] p-3 text-xs text-black/50"
            placeholder="请输入..."
            value={data.purpose}
            onChangeText={(text) => onChange({ ...data, purpose: text })}
          />
        </View>

        {/* 态度 */}
        <View>
          <Text className="mb-2 text-sm font-bold text-black">态度：</Text>
          <TextInput
            className="rounded-md bg-[rgba(20,131,253,0.05)] p-3 text-xs text-black/50"
            placeholder="请输入..."
            value={data.attitude}
            onChangeText={(text) => onChange({ ...data, attitude: text })}
          />
        </View>

        {/* 行动计划 */}
        <View>
          <Text className="mb-2 text-sm text-black">行动计划（Do方法和策略）：（怎么做）</Text>
          <View className="rounded-md bg-[rgba(20,131,253,0.05)] p-3">
            <TextInput
              className="text-xs text-black/50"
              placeholder="请输入行动计划..."
              value={data.actionPlan}
              onChangeText={(text) => onChange({ ...data, actionPlan: text })}
              multiline={true}
              numberOfLines={5}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />
            <Text className="text-right text-xs text-black/50">
              {data.actionPlan.length}/300
            </Text>
          </View>
        </View>

        {/* 目标数量 */}
        <View>
          <Text className="mb-2 text-sm font-bold text-black">目标数量：</Text>
          <View className="flex-row space-x-3">
            <TextInput
              className="flex-1 rounded-md bg-[rgba(20,131,253,0.05)] p-3 text-xs text-black/50"
              placeholder="请输入数量"
              value={data.targetQuantity.toString()}
              onChangeText={(text) => onChange({ ...data, targetQuantity: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TextInput
              className="flex-1 rounded-md bg-[rgba(20,131,253,0.05)] p-3 text-xs text-black/50"
              placeholder="请输入单位"
              value={data.unit}
              onChangeText={(text) => onChange({ ...data, unit: text })}
            />
          </View>
        </View>

        {/* 预期结果 */}
        <View>
          <Text className="mb-2 text-sm text-black">预期结果（Have拥有）：（含时间节点）</Text>
          <View className="rounded-md bg-[rgba(20,131,253,0.05)] p-3">
            <TextInput
              className="text-sm text-black/50"
              placeholder="请输入..."
              value={data.expectedResult}
              onChangeText={(text) => onChange({ ...data, expectedResult: text })}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
            />
            <Text className="text-right text-xs text-black/50">
              {data.expectedResult.length}/300
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface Achievement {
  id?: string;
  bookId: string;
  title: string;
  commitment: string;
  targetQuantity: number;
  unit: string;
  purpose: string;
  attitude: string;
  actionPlan: string;
  expectedResult: string;
  completedQuantity: number;
  completionRate: number;
  createTime?: string;
  updateTime?: string;
}

export default function Achievement() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([{
    bookId: "1911671090439000066",
    title: "标题1",
    commitment: "",
    targetQuantity: 0,
    unit: "",
    purpose: "",
    attitude: "",
    actionPlan: "",
    expectedResult: "",
    completedQuantity: 0,
    completionRate: 0
  }]);
  const [loading, setLoading] = useState(false);
  const [achievementId, setAchievementId] = useState<string>('');
  const [goals, setGoals] = useState<Achievement[]>([]);

  // 获取现有成就数据和目标
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取当前激活的成就书
        const achievementResponse = await achievementBookApi.getActiveAchievementBook();
        console.log('获取成就书响应:', achievementResponse);

        if (achievementResponse?.data?.id) {
          setAchievementId(achievementResponse.data.id);

          // 获取成就书对应的目标列表
          const goalsResponse = await achievementBookApi.getGoalsByBookId(achievementResponse.data.id);
          console.log('获取目标列表响应:', goalsResponse);

          if (goalsResponse?.data) {
            const goalsData = goalsResponse.data as unknown as Achievement[];
            setGoals(goalsData);
            if (goalsData.length > 0) {
              setAchievements(goalsData);
            }
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  // 添加新的成就项
  const handleAddAchievement = () => {
    const newData: Achievement = {
      bookId: "1911671090439000066",
      title: "标题1",
      commitment: "",
      targetQuantity: 0,
      unit: "",
      purpose: "",
      attitude: "",
      actionPlan: "",
      expectedResult: "",
      completedQuantity: 0,
      completionRate: 0
    };
    setAchievements([...achievements, newData]);
    achievementBookApi.createGoal(newData);
  };

  // 删除成就项
  const handleDeleteAchievement = async (index: number) => {
    if (achievements.length > 1) {
      const achievement = achievements[index];

      // 显示确认对话框
      Alert.alert(
        '确认删除',
        '确定要删除这个目标吗？',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '确定',
            style: 'destructive',
            onPress: async () => {
              try {
                if (achievement.id) {
                  // 如果有ID，调用删除接口
                  const response = await achievementBookApi.deleteGoal(achievement.id);
                  console.log('删除目标响应:', response);

                  // 删除成功，更新本地状态
                  if (
                    response.code === 200
                  ) {
                    const newAchievements = [...achievements];
                    newAchievements.splice(index, 1);
                    setAchievements(newAchievements);
                    Alert.alert('成功', '目标已删除');
                  } else {
                    Alert.alert('失败', '目标删除失败');
                  }
                } else {
                  // 如果没有ID，直接从本地状态中删除
                  const newAchievements = [...achievements];
                  newAchievements.splice(index, 1);
                  setAchievements(newAchievements);
                }
              } catch (error) {
                console.error('删除目标失败:', error);
                Alert.alert('提示', '删除失败，请稍后重试');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('提示', '至少需要保留一个成就项');
    }
  };

  // 更新成就项数据
  const handleAchievementChange = async (index: number, data: Achievement) => {
    const newAchievements = [...achievements];
    newAchievements[index] = data;
    setAchievements(newAchievements);

    // 如果有ID，说明是已存在的目标，需要更新
    if (data.id) {
      try {
        const response = await achievementBookApi.updateGoal(data.id, {
          bookId: data.bookId,
          title: data.title,
          commitment: data.commitment,
          targetQuantity: data.targetQuantity,
          unit: data.unit,
          purpose: data.purpose,
          attitude: data.attitude,
          actionPlan: data.actionPlan,
          expectedResult: data.expectedResult,
          completedQuantity: data.completedQuantity,
          completionRate: data.completionRate
        });
        console.log('更新目标响应:', response);
      } catch (error) {
        console.error('更新目标失败:', error);
        Alert.alert('提示', '更新失败，请稍后重试');
      }
    }
  };

  // 保存成就数据
  const handleSaveAchievement = async () => {
    // 验证所有成就项
    for (const achievement of achievements) {
      if (!achievement.title.trim()) {
        Alert.alert('提示', '请先填写标题');
        return;
      }

      if (!achievement.purpose.trim()) {
        Alert.alert('提示', '请先填写目的');
        return;
      }
    }

    setLoading(true);
    try {
      // 遍历所有目标
      for (const achievement of achievements) {
        if (achievement.id) {
          // 已存在的目标，调用更新接口
          try {
            const response = await achievementBookApi.updateGoal(achievement.id, {
              bookId: achievement.bookId,
              title: achievement.title,
              commitment: achievement.commitment,
              targetQuantity: achievement.targetQuantity,
              unit: achievement.unit,
              purpose: achievement.purpose,
              attitude: achievement.attitude,
              actionPlan: achievement.actionPlan,
              expectedResult: achievement.expectedResult,
              completedQuantity: achievement.completedQuantity,
              completionRate: achievement.completionRate
            });
            console.log('更新目标响应:', response);
          } catch (error) {
            console.error('更新目标失败:', error);
            Alert.alert('提示', '更新失败，请稍后重试');
            setLoading(false);
            return;
          }
        } else {
          // 新目标，调用创建接口
          try {
            const goalResponse = await achievementBookApi.createGoal(achievement);
            console.log('创建目标响应:', goalResponse);
          } catch (error) {
            console.error('创建目标失败:', error);
            Alert.alert('提示', '创建失败，请稍后重试');
            setLoading(false);
            return;
          }
        }
      }

      Alert.alert('成功', '成就内容已保存');
      router.back();
    } catch (error) {
      console.error('保存成就内容失败:', error);
      Alert.alert('保存失败', '请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-white'>
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] font-semibold">创造成果</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <ScrollView
        className="flex-1 bg-[#F5F5F5] px-4 pt-4"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
      >


        {/* 成就项列表 */}
        {achievements.map((achievement, index) => (
          <AchievementItem
            key={index}
            data={achievement}
            onChange={(data) => handleAchievementChange(index, data)}
            onDelete={() => handleDeleteAchievement(index)}
            index={index}
          />
        ))}

        {/* 添加按钮 */}
        <TouchableOpacity
          onPress={handleAddAchievement}
          className="mb-4 mt-3 flex h-[50px] w-full items-center justify-center rounded-[6px] border border-[#1483FD] bg-white"
        >
          <View className="relative h-[30px] w-[30px]">
            <View className="absolute left-0 top-[13px] h-[4px] w-full bg-[#1483FD]" />
            <View className="absolute left-[13px] top-0 h-full w-[4px] bg-[#1483FD]" />
          </View>
        </TouchableOpacity>

        {/* 确认按钮 */}
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="mt-4 rounded-md p-3 shadow-lg"
          style={{
            boxShadow: "0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
          }}
        >
          <TouchableOpacity
            onPress={handleSaveAchievement}
            disabled={loading}
          >
            <Text className="text-center text-xl font-bold text-white">
              {loading ? '保存中...' : '确认'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView></View>
  );
}