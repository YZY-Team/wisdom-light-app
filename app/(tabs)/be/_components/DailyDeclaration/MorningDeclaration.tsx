// 导入必要的React Native和第三方组件
import { View, Text, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { dailyDeclarationApi } from '~/api/be/dailyDeclaration';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 定义时间段项的类型接口
type TimeSlotItem = {
  content: string; // 内容描述
  time: string;    // 时间点
};

// 定义时间段区块的类型接口
type TimeSlotSection = {
  title: string;        // 区块标题（上午/中午/下午/晚上）
  items: TimeSlotItem[]; // 该时间段的具体项目列表
};

// 定义组件的属性类型接口
type MorningDeclarationProps = {
  date: Date;                 // 日期
  timeSlots: TimeSlotSection[]; // 时间段数据
  expanded?: boolean;         // 是否展开显示详细内容
  showHeader?: boolean;       // 是否显示标题栏
  declarationId?: string;     // 日宣告ID
  onUpdate?: () => void;      // 更新回调
};

// 根据时间段标题获取对应的颜色
const getBarColor = (title: string) => {
  switch (title) {
    case '上午':
      return '#7AE1C3';
    case '中午':
      return '#FBA720';
    case '下午':
      return '#1587FD';
    case '晚上':
      return '#440063';
    default:
      return '#1483FD';
  }
};

// 早宣告组件：展示每日早晨的时间段计划
export default function MorningDeclaration({ date, timeSlots, expanded = true, showHeader = true, declarationId, onUpdate }: MorningDeclarationProps) {
  // 编辑状态管理
  const [editingStates, setEditingStates] = useState<{ [key: string]: boolean }>({});
  // 临时内容管理
  const [tempContents, setTempContents] = useState<{ [key: string]: string }>({});
  // 加载状态管理
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // 开始编辑
  const startEditing = (sectionTitle: string, itemIndex: number, content: string) => {
    const key = `${sectionTitle}-${itemIndex}`;
    setEditingStates(prev => ({ ...prev, [key]: true }));
    setTempContents(prev => ({ ...prev, [key]: content }));
  };

  // 保存编辑
  const saveEditing = async (sectionTitle: string, itemIndex: number) => {
    if (!declarationId) return;

    const key = `${sectionTitle}-${itemIndex}`;
    const content = tempContents[key];

    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }));

      // 根据时间段更新对应的字段
      const updateData: any = {};
      switch (sectionTitle) {
        case '上午':
          updateData.morningPlan = content;
          break;
        case '中午':
          updateData.noonPlan = content;
          break;
        case '下午':
          updateData.afternoonPlan = content;
          break;
        case '晚上':
          updateData.eveningPlan = content;
          break;
      }

      await dailyDeclarationApi.updateNewDailyDeclaration(declarationId, updateData);

      // 更新成功后清除编辑状态
      setEditingStates(prev => ({ ...prev, [key]: false }));
      // 只在明确需要刷新整个列表时才触发onUpdate回调
      // if (onUpdate) {
      //   onUpdate();
      // }
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  // 取消编辑
  const cancelEditing = (sectionTitle: string, itemIndex: number) => {
    const key = `${sectionTitle}-${itemIndex}`;
    setEditingStates(prev => ({ ...prev, [key]: false }));
    setTempContents(prev => ({ ...prev, [key]: '' }));
  };

  // 处理文本输入变更
  const handleTextChange = (sectionTitle: string, itemIndex: number, text: string) => {
    const key = `${sectionTitle}-${itemIndex}`;
    setTempContents(prev => ({ ...prev, [key]: text }));
  };

  // 处理回车保存
  const handleSubmitEditing = (sectionTitle: string, itemIndex: number) => {
    saveEditing(sectionTitle, itemIndex);
  };

  // 处理失去焦点保存
  const handleBlur = (sectionTitle: string, itemIndex: number) => {
    saveEditing(sectionTitle, itemIndex);
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
            早宣告
          </Text>
          <Text className="text-[16px] text-white">{`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`}</Text>
        </LinearGradient>
      )}

      {/* 只在展开状态下显示时间段列表区域 */}
      {expanded && (
        <View className="p-4">
          {timeSlots.map((section, sectionIndex) => (
            <View key={section.title} className="mb-4 flex-row">
              {/* 左侧时间段标题和装饰条 */}
              <View className="mr-4 h-[80px] flex-row items-center">
                <View
                  className="mr-2 h-8 w-1 rounded-full"
                  style={{ backgroundColor: getBarColor(section.title) }}
                />
                <Text
                  style={{
                    fontFamily: 'Arial',
                  }}
                  className="text-[16px] font-bold text-gray-700">
                  {section.title} {':'}
                </Text>
              </View>
              {/* 右侧计划内容列表 */}
              <View className="flex flex-1 flex-col gap-2">
                {section.items.map((item, itemIndex) => {
                  const key = `${section.title}-${itemIndex}`;
                  const isEditing = editingStates[key];
                  const isLoading = loadingStates[key];

                  return (
                    <View
                      key={`${section.title}-${itemIndex}`}
                      className="relative h-[80px] overflow-hidden rounded-[6px]">
                      {/* 装饰性模糊圆点 */}
                      <View
                        className="absolute bottom-[10px] right-[10px] h-[30px] w-[30px] rounded-full opacity-100"
                        style={{
                          backgroundColor: getBarColor(section.title),
                          filter: 'blur(15px)',
                        }}
                      />
                      {/* 半透明背景 */}
                      <BlurView intensity={10} className="absolute h-full w-full bg-[#1483FD1A]/10" />
                      {/* 计划内容输入框 */}
                      <TextInput
                        className="z-10 h-[80px] p-3 text-gray-600"
                        placeholder={`请输入${section.title}的计划...`}
                        multiline
                        textAlignVertical="top"
                        value={tempContents[key] || item.content}
                        onChangeText={(text) => handleTextChange(section.title, itemIndex, text)}
                        onBlur={() => handleBlur(section.title, itemIndex)}
                        blurOnSubmit={true}
                      />
                      {/* 加载中指示器 */}
                      {loadingStates[`${section.title}-${itemIndex}`] && (
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
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}