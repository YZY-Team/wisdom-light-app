import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

export default function WeeklyDeclaration() {
  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      contentContainerStyle={{
        paddingBottom: 160, // 40 * 4，确保底部内容不被导航栏遮挡
      }}>
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
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px]  justify-center px-4">
          <Text className="font-bold text-white">行动计划</Text>
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
              <View className="flex flex-row justify-between gap-2 py-2">
                <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                  {[...'个人成就计划'].map((char, index) => (
                    <Text key={index} className="text-[16px]   font-bold">
                      {char}
                    </Text>
                  ))}
                </View>
                <View className="flex flex-1 flex-col gap-2">
                  {['上午', '中午', '下午', '晚上'].map((time) => (
                    <View key={time} className="">
                      <View className="relative min-h-[50px] rounded-lg bg-[#F5F8FF]">
                        <View className="absolute left-3 top-3 z-10">
                          <Text className="text-[12px] text-gray-600">{time}：</Text>
                        </View>
                        <TextInput
                          className="p-3 pl-[45px] text-[12px]"
                          placeholderTextColor="#9CA3AF"
                          placeholder="今天我计划完成项目报告的初稿，并与团队讨论下一步计划。我会保..."
                          multiline
                          textAlignVertical="top"
                          defaultValue=""
                          selection={{ start: 0, end: 0 }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className="mr-4 items-center">
              <View className="flex flex-row justify-between gap-2 py-2">
                <View className="w-[30px] flex-col items-center justify-center rounded-[6px] bg-[#5264FF1A]">
                  {[...'完成情况'].map((char, index) => (
                    <Text key={index} className="text-[16px]   font-bold">
                      {char}
                    </Text>
                  ))}
                </View>
                <View className="flex flex-1 flex-col gap-2">
                  <View className="relative  rounded-lg bg-[#F5F8FF]">
                    <TextInput
                      className="min-h-[130px] p-3 pl-[12px] text-[12px]"
                      placeholderTextColor="#9CA3AF"
                      placeholder="请输入..."
                      multiline
                      textAlignVertical="top"
                      defaultValue=""
                      selection={{ start: 0, end: 0 }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 第1周总结 */}
      <View className="mb-4 overflow-hidden rounded-xl bg-white">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
          }}
          className="flex h-[38px]  justify-center px-4">
          <Text className="font-bold text-white">第一周总结</Text>
        </LinearGradient>
        <View className="p-4">
          {/* 进度条 */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className=" text-[16px]  font-bold">本周达成:</Text>
            <View className="ml-2 mr-4 h-2 w-[60%] rounded-full bg-gray-200">
              <View className="h-full w-[80%] rounded-full bg-[#20B4F3]" />
            </View>
            <Text className="text-[#FF9F21]">80%</Text>
          </View>
          <View className="mb-4 flex-row gap-1">
            <Text className="mb-2 text-sm ">达成成果:</Text>
            <TextInput
              className="min-h-[60px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2    text-[14px] font-bold">从本周成果和行动出发自我总结:</Text>
            <TextInput
              className="min-h-[60px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2 text-sm ">
              123、4+5+6本周我运用了哪些?特别有体验的是哪条,为什么?
            </Text>
            <TextInput
              className="min-h-[60px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4  gap-1">
            <Text className="mb-2 text-sm ">我的下一步:</Text>
            <TextInput
              className="min-h-[60px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">本周打分:</Text>
            <TextInput
              className="min-h-[36px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">本周体验:</Text>
            <TextInput
              className="min-h-[36px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">行得通:</Text>
            <TextInput
              className="min-h-[36px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">学习到:</Text>
            <TextInput
              className="min-h-[36px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
          <View className="mb-4 flex-row items-center gap-1">
            <Text className="mb-2 w-[60px]  text-sm">下一步:</Text>
            <TextInput
              className="min-h-[36px] flex-1 rounded-lg bg-[#F5F8FF] p-3"
              placeholder="请输入..."
              multiline
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
