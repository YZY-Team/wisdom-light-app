// 导入必要的React Native和第三方组件
import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';

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
};

// 晚总结组件：展示每日晚间的总结报告
export default function EveningDeclaration({ date, eveningReport, showHeader = true }: EveningDeclarationProps) {
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
        {eveningReport.map((reportItem, index) => (
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
                value={reportItem.value}
                editable={false}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}