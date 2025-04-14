// 导入必要的React Native和第三方组件
import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';

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
export default function MorningDeclaration({ date, timeSlots, expanded = true, showHeader = true }: MorningDeclarationProps) {
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
                {section.items.map((item, itemIndex) => (
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
                      value={item.content}
                      editable={false}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}