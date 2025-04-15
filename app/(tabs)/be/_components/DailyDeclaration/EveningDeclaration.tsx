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

// 定义晚总结报告项的类型接口
type EveningReportItem = {
  label: string;  // 报告项标签（如：打分、体验等）
  value: string;  // 报告项内容
};

// 定义组件的属性类型接口
type EveningDeclarationProps = {
  date: Date;                    // 日期
  eveningReport: EveningReportItem[]; // 晚总结报告数据
  showHeader?: boolean;          // 是否显示标题栏
  declarationId?: string;        // 宣告ID
  onUpdate?: () => void;         // 更新回调
};

// 晚总结组件：展示每日晚间的总结报告
export default function EveningDeclaration({ date, eveningReport, showHeader = true, declarationId, onUpdate }: EveningDeclarationProps) {
  // 编辑状态管理
  const [editingStates, setEditingStates] = useState<{ [key: string]: boolean }>({});
  // 临时内容管理
  const [tempContents, setTempContents] = useState<{ [key: string]: string }>({});
  // 加载状态管理
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // 开始编辑
  const startEditing = (label: string, content: string) => {
    setEditingStates(prev => ({ ...prev, [label]: true }));
    setTempContents(prev => ({ ...prev, [label]: content }));
  };

  // 保存编辑
  const saveEditing = async (label: string) => {
    if (!declarationId) return;

    const content = tempContents[label];

    try {
      setLoadingStates(prev => ({ ...prev, [label]: true }));

      // 根据标签更新对应的字段
      const updateData: any = {};
      switch (label) {
        case '打分':
          updateData.dayScore = content;
          break;
        case '体验':
          updateData.dayExperience = content;
          break;
        case '行得通':
          updateData.whatWorked = content;
          break;
        case '行不通':
          updateData.whatDidntWork = content;
          break;
        case '学习到':
          updateData.whatLearned = content;
          break;
        case '下一步':
          updateData.whatNext = content;
          break;
      }

      await dailyDeclarationApi.updateNewDailyDeclaration(declarationId, updateData);

      // 更新成功后清除编辑状态
      setEditingStates(prev => ({ ...prev, [label]: false }));
      // 只在明确需要刷新整个列表时才触发onUpdate回调
      // if (onUpdate) {
      //   onUpdate();
      // }
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [label]: false }));
    }
  };

  // 取消编辑
  const cancelEditing = (label: string) => {
    setEditingStates(prev => ({ ...prev, [label]: false }));
    setTempContents(prev => ({ ...prev, [label]: '' }));
  };

  // 处理文本输入变更
  const handleTextChange = (label: string, text: string) => {
    setTempContents(prev => ({ ...prev, [label]: text }));
  };

  // 处理失去焦点保存
  const handleBlur = (label: string) => {
    saveEditing(label);
  };

  return (
    <View className="overflow-hidden rounded-b-xl bg-white">
      {/* 头部渐变标题栏 */}
      {showHeader && (
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex h-[38px] flex-row items-center justify-between rounded-t-xl px-4"
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}>
          <Text
            className="text-white"
            style={{
              fontSize: 16,
              fontWeight: '800',
              lineHeight: 20,
            }}>
            晚总结
          </Text>
        </LinearGradient>
      )}

      {/* 报告项列表区域 */}
      <View className="p-4">
        {eveningReport.map((reportItem, index) => {
          const isLoading = loadingStates[reportItem.label];
          
          return (
            <View key={reportItem.label} className="mb-4 flex flex-row items-start">
              {/* 左侧标签 */}
              <View className="mt-3 w-12 flex-row justify-between">
                {[...reportItem.label].map((char, i) => (
                  <Text key={i} className="text-[14px] font-medium text-gray-700">
                    {char}
                  </Text>
                ))}
              </View>
              <Text className="mt-3 px-1 text-sm font-medium text-gray-700">:</Text>
              {/* 右侧内容输入区域 */}
              <View className="relative flex-1 overflow-hidden rounded-[6px]">
                <BlurView intensity={10} className="absolute h-full w-full bg-[#1483FD1A]/10" />
                <TextInput
                  className="z-10 min-h-[54px] p-3 text-gray-600"
                  placeholder={`请输入${reportItem.label}...`}
                  multiline
                  textAlignVertical="top"
                  value={tempContents[reportItem.label] || reportItem.value}
                  onChangeText={(text) => handleTextChange(reportItem.label, text)}
                  onBlur={() => handleBlur(reportItem.label)}
                  blurOnSubmit={true}
                  editable={declarationId !== undefined}
                />
                {/* 加载中指示器 */}
                {loadingStates[reportItem.label] && (
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
          );
        })}
      </View>
    </View>
  );
}