import { View, Text, ScrollView, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Oath() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* 固定的顶部导航 */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] font-semibold">我的约誓</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 可滚动的内容区域 */}
      <ScrollView
        className="mt-4  flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-base leading-6 text-gray-600">
          成就我的目标，是为了
          <Text className="font-[600]">支持我成就我的理想</Text>
          ，透过
          <Text className="font-[600]">清晰目的、具体目标、有效计划和承诺行动</Text>
          ，以致在"IN领袖之道"期间创造我想要的成果。在成就书中宣言我想要的目标，必须是对我是
          <Text className="font-[600]">重要的、有价值的、具有挑战性的、有伸展性的及可度量的</Text>。
        </Text>

        <View className="flex-row items-center">
          <Text className="text-base font-[600] text-[#1483FD]">教练：</Text>
          <TouchableOpacity className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-[#1483FD0D]">
            <AntDesign name="plus" size={20} color="#1483FD" />
          </TouchableOpacity>
        </View>

        <View className="mt-4 h-[200px] rounded-lg bg-[#1483FD0D] p-4">
          <TextInput className="text-sm text-gray-400" placeholder="请输入..." />
        </View>

        <View className="mt-20 w-full">
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full rounded-[6px]"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Pressable className="h-[44px] items-center justify-center">
              <Text
                className="text-center text-[16px] text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '700',
                }}>
                确认
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
