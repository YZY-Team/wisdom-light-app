import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { achievementBookApi } from '~/api/be/achievementBook';
import { AchievementBookDTO } from '~/types/be/achievementBookType';

export default function PromisePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [promise, setPromise] = useState('');
  const [loading, setLoading] = useState(false);
  const achievementId = '1911671090439000066'; // 固定ID

  // 获取现有承诺内容
  useEffect(() => {
    const fetchPromise = async () => {
      try {
        const response = await achievementBookApi.getActiveAchievementBook();
        console.log('获取成就书响应:', response);

        // 使用类型断言处理实际返回的数据格式
        if (response.code === 200) {
          const data = response.data;
          if (data.promise) {
            setPromise(data.promise);
          }
        }
      } catch (error) {
        console.error('获取承诺内容失败:', error);
      }
    };

    fetchPromise();
  }, []);

  // 保存承诺内容
  const handleSavePromise = async () => {
    if (!promise.trim()) {
      Alert.alert('提示', '请先填写承诺内容');
      return;
    }

    setLoading(true);
    try {


      // 调用API保存
      const response = await achievementBookApi.updateAchievementBook(achievementId, { promise });

      console.log('保存响应:', response);

      // 根据实际API响应结构处理结果
      if (response) {
        Alert.alert('成功', '承诺内容已保存');
        router.back();
      } else {
        Alert.alert('保存失败', '请稍后重试');
      }
    } catch (error) {
      console.error('保存承诺内容失败:', error);
      Alert.alert('保存失败', '请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

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
              value={promise}
              onChangeText={setPromise}
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
            <Pressable
              className="h-[44px] items-center justify-center"
              onPress={handleSavePromise}
              disabled={loading}
            >
              <Text
                className="text-center text-[16px] text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '700',
                }}>
                {loading ? '保存中...' : '确认'}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}