// 导入必要的React Native和第三方组件
import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// 定义组件的属性类型接口
type DailyResultProps = {
  goals: Array<{
    content: string;  // 目标内容
    unit?: string;    // 可选的单位（如：个、次、份等）
  }>;
  weeklyProgress: string;   // 周进度（格式：实际/目标）
  monthlyProgress: string;  // 月进度（格式：实际/目标）
  showHeader?: boolean;     // 是否显示标题栏
  showGoalsOnly?: boolean;  // 是否只显示目标部分
};

// 今日成果组件：展示每日目标完成情况和进度
export default function DailyResult({ 
  goals, 
  weeklyProgress, 
  monthlyProgress,
  showHeader = true,
  showGoalsOnly = false
}: DailyResultProps) {
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
        <View>
          <View className="mb-2 flex flex-row items-center">
            <View className="mr-2 h-8 w-1 rounded-full bg-[#1483FD]" />
            <Text className=" text-[16px] font-[700] text-black">今日完成</Text>
          </View>
          <View>
            {goals.map((goal, index) => (
              <View key={index} className="relative mb-4 overflow-hidden rounded-[6px]">
                <View className="flex-col">
                  <Text className="ml-1  text-[14px] font-medium text-gray-700">
                    目标{index + 1}：
                  </Text>
                  <View className="flex-row items-center">
                    <BlurView intensity={10} className="absolute h-full w-full bg-[#1483FD0D]" />
                    <TextInput
                      className="z-10 min-h-[47px] flex-1 p-3 text-gray-600"
                      placeholder={`请输入目标${index + 1}...`}
                      multiline
                      value={goal.content}
                      editable={false}
                    />
                    {goal.unit && <Text className="mr-3 text-gray-500">{goal.unit}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* 今日进度展示区域 - 只有在非showGoalsOnly模式下显示 */}
        {!showGoalsOnly && (
          <View className="mt-6 flex-col justify-between gap-2">
            <View className="mb-2 flex flex-row items-center">
              <View className="mr-2 h-8 w-1 rounded-full bg-[#1483FD]" />
              <Text className=" text-[16px] font-[700] text-black">今日进度</Text>
            </View>
            <View>
              {Array.from({ length: 3 }, (_, index) => index + 1).map((index) => (
                <View key={index} className="relative mb-4 overflow-hidden rounded-[6px]">
                  <View className="flex-col">
                    <Text className="ml-1  text-[14px] font-[600] text-gray-700">目标{index}:</Text>
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
                          周累计应达成/实际达成
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
                              fontSize: 24,
                              fontWeight: '700',
                              zIndex: 1,
                            }}>
                            {monthlyProgress}
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
                          本周宣告/实际达成
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
                              fontSize: 24,
                              fontWeight: '700',
                              zIndex: 1,
                            }}>
                            {weeklyProgress}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}