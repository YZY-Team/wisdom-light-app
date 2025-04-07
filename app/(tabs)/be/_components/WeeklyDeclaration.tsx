import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

export default function WeeklyDeclaration() {
  return (
    <ScrollView className="flex-1 px-4 pt-4">
      {/* 标题部分 */}
      <View className="mb-4 flex-col items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-base font-medium">第一周宣告:IN79爱是一切的根源</Text>
          <Pressable className="ml-2">
            <Ionicons name="create-outline" size={16} color="#1483fd" />
          </Pressable>
        </View>
        <Text className="text-sm text-gray-400">2023年5月13日</Text>
      </View>

      {/* 成果宣告 */}
      <View className="mb-4 overflow-hidden rounded-xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px]  justify-center px-4">
          <Text className="font-bold text-white">成果宣告</Text>
        </LinearGradient>
        <View className="">
          <TextInput
            className="min-h-[80px] rounded-lg  p-3"
            placeholder="请输入宣告成果..."
            multiline
          />
        </View>
      </View>

      {/* 行动计划 */}
      <View className="mb-4 overflow-hidden rounded-2xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex h-[38px] items-center px-4">
          <Text className="text-lg font-bold  text-white">行动计划</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 星期选择器 */}
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <Pressable
                  key={day}
                  className={`mr-4 ${index === 0 ? 'border-b-2 border-[#1483FD]' : ''}`}>
                  <Text className={`text-base ${index === 0 ? 'text-[#1483FD]' : 'text-gray-400'}`}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="flex-col">
            {/* 左侧标签 */}
            <View className="mr-4 items-center">
              <View className="flex h-[320px] flex-row justify-between py-2">
                <View className="w-[30px] flex-col bg-[#5264FF1A]">
                  {[...'个人成就计划'].map((char, index) => (
                    <Text key={index} className="text-base text-gray-600">
                      {char}
                    </Text>
                  ))}
                </View>
                <View className="flex-1">
                  {['上午', '中午', '下午', '晚上'].map((time) => (
                    <View key={time} className="mb-4">
                      <View className="relative">
                        <View className="absolute left-3 top-3 z-10">
                          <Text className="text-base text-gray-600">{time}：</Text>
                        </View>
                        <TextInput
                          className="min-h-[60px] rounded-lg bg-[#F5F8FF] pl-16 pr-3 pt-3"
                          placeholder={`今天上午我计划完成项目报告的初稿，并与团队讨论下一步计划。我会保...`}
                          multiline
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 右侧内容 */}
            {/* <View className="flex-1">
              
              <TextInput
                className="mt-4 min-h-[100px] rounded-lg bg-[#F5F8FF] p-3"
                placeholder="请输入..."
                multiline
              />
            </View> */}
          </View>
        </View>
      </View>

      {/* 第1周总结 */}
      <View className="mb-4 overflow-hidden rounded-xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex h-[38px] items-center px-4">
          <Text className="font-bold text-white">第1周总结</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 进度条 */}
          <View className="mb-4">
            <Text className="mb-2">本周达成：80%</Text>
            <View className="h-2 w-full rounded-full bg-gray-200">
              <View className="h-full w-[80%] rounded-full bg-[#20B4F3]" />
            </View>
          </View>
          {/* 总结项目 */}
          {[
            '达成成果：',
            '从本周成果中行动发现发生的改变：',
            '本周分享：',
            '本周体验：',
            '行得通：',
            '学习到：',
            '下一步：',
            '本周挺困扰了7碰到了特别体验的思维事，为什么？',
            '我的下一步：',
          ].map((item) => (
            <View key={item} className="mb-4">
              <Text className="mb-2 text-sm text-gray-600">{item}</Text>
              <TextInput
                className="min-h-[60px] rounded-lg bg-[#F5F8FF] p-3"
                placeholder="请输入..."
                multiline
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
