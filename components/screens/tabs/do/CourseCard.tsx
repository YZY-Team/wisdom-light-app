import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { onlineCoutseApi } from '~/api/do/onlineCoutse';
import { useUserStore } from '~/store/userStore';

cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

type CourseCardProps = {
  title: string;
  instructor: string;
  description: string;
  startTime: string;
  enrolledCount: number;
  maxEnrollment: number;
  price: number;
  instructorTitle: string;
  platform: string;
  isBooked?: boolean;
  onReserve: () => void;
  id: string;
  coverUrl: string;
};

const CourseCard = ({
  title,
  instructor,
  description,
  startTime,
  enrolledCount,
  maxEnrollment,
  price,
  instructorTitle,
  platform,
  isBooked,
  id,
  onReserve,
  coverUrl,
}: CourseCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { userInfo } = useUserStore();
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleReservePress = () => {
    setShowModal(true);
  };

  const handlePayment = async (id: string) => {
    const res = await onlineCoutseApi.reserveOnlineCoutse(id);
    if (res.code === 200) {
      Alert.alert('预约成功');
      onReserve();
    } else {
      console.log('预约失败', res);

      // @ts-expect-error 类型错误
      Alert.alert(res.error);
    }
    setShowModal(false);
  };

  return (
    <View className="mb-4">
      <Text className="mb-1 text-[16px] font-bold text-black">{title}</Text>

      <Pressable onPress={toggleExpand}>
        <View className="overflow-hidden rounded-[6px] bg-white shadow-sm">
          {/* 卡片内容 */}
          <View className="rounded-[6px] bg-[#fff] p-4">
            <View className="flex-row">
              {/* 导师信息部分 */}
              <View className="flex-1 flex-col gap-2">
                <View className="flex-row items-center">
                  <Text className="text-[14px] font-normal text-black">{instructor}</Text>
                </View>
                <View className=" w-[60px] rounded-[4px] bg-[rgba(241,131,24,0.1)] px-1 py-1">
                  <Text className="text-[12px]  font-normal text-[#F18318]">{instructorTitle}</Text>
                </View>
                <Text className="mt-1 text-[14px] font-bold text-[rgba(0,0,0,0.5)]">
                  毕业平台：{platform}
                </Text>
              </View>

              {/* 图片部分 - 可以根据实际需求替换 */}
              <View className=" aspect-[120/90] w-[120px] overflow-hidden rounded-[6px] bg-[#D9D9D9]">
                <Image source={coverUrl} className="h-full w-full" contentFit="cover" />
              </View>
            </View>

            {/* 简介部分 - 收起状态 */}
            {!expanded && (
              <Text
                className="mt-3 text-[12px] font-normal text-[rgba(0,0,0,0.4)]"
                numberOfLines={2}>
                {description}
              </Text>
            )}

            {/* 展开状态的详细内容 */}
            {expanded && (
              <View className="mt-3">
                <Text className="text-[12px] font-normal text-[rgba(0,0,0,0.4)]">
                  {description}
                </Text>

                <View className="mt-3">
                  {/* 开始时间和人数在同一行，两侧对齐 */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[12px] font-normal text-black">
                      开始时间：{startTime}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-[14px] font-normal text-[rgba(0,0,0,0.4)]">
                        已预约人数：
                      </Text>
                      <Text className="text-[14px] font-normal text-[#1483FD]">
                        {enrolledCount}
                      </Text>
                      <Text className="text-[14px] font-normal text-[rgba(0,0,0,0.4)]">
                        /{maxEnrollment}
                      </Text>
                    </View>
                  </View>

                  {/* 售价放在右侧 */}
                  <View className="mt-3 flex-row items-center justify-between">
                    <View />
                    <View className="flex-row items-center">
                      <Text className="text-[14px] font-bold text-[rgba(0,0,0,0.4)]">售价：</Text>
                      <Text className="text-[20px] font-bold text-[#1483FD]">{price}￥</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={isBooked ? undefined : handleReservePress}
                    className={`mt-6 self-stretch ${isBooked ? 'opacity-50' : ''}`}>
                    <LinearGradient
                      colors={['#20B4F3', '#5762FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="items-center justify-center rounded-[6px] py-[14px]"
                      style={{
                        boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                      }}>
                      <Text className="text-[20px] font-bold text-white">
                        {isBooked ? '已预约' : '立即预约'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Pressable>

      {/* 预约确认弹窗 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="relative w-[320px] overflow-hidden rounded-[12px] bg-white">
            <Pressable
              onPress={() => setShowModal(false)}
              className="absolute right-4 top-4 h-4   w-4">
              <Image
                source={require('~/assets/close.png')}
                className="h-full w-full"
                contentFit="cover"
              />
            </Pressable>
            {/* 弹窗标题 */}
            <View className="relative w-full items-center justify-center p-3 pt-5">
              <Text className="text-[18px] font-bold text-black">课程预约</Text>
            </View>

            {/* 课程图片 */}
            <View className="items-center px-4">
              <View className="h-[130px] w-[272px] overflow-hidden rounded-[8px] bg-gray-200">
                <Image source={coverUrl} className="h-full w-full" contentFit="cover" />
              </View>
            </View>

            {/* 课程信息 */}
            <View className="mb-2 mt-6 px-4 pb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[16px] text-black">《{title}》</Text>
                <Text className="text-[18px] font-bold text-[#1483FD]">{price}￥</Text>
              </View>
            </View>

            {/* 确认按钮 */}
            <Pressable onPress={() => handlePayment(id)} className="mx-4 mb-4 mt-1">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center rounded-[6px] py-[14px]"
                style={{
                  boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                }}>
                <Text className="text-[18px] font-bold text-white">支付</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'rgba(20, 131, 253, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
});

export default CourseCard;
