import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Promise() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* 固定的顶部导航 */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] font-semibold">我的承诺</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 可滚动的内容区域 */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 48,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          <View className="mt-4 h-[200px] rounded-lg bg-[#1483FD0D] p-4">
            <TextInput
              className="flex-1 text-sm text-gray-600"
              placeholder="（贡献是关于特质的，例：贡献我的真诚、热情、爱……）"
              placeholderTextColor="#999999"
              textAlignVertical="top"
              multiline
            />
          </View>
        </View>

        <View className="w-full">
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