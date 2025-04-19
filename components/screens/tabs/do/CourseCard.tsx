import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

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
  onReserve,
}: CourseCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleReservePress = () => {
    setShowModal(true);
  };

  const handlePayment = () => {
    setShowModal(false);
    onReserve();
  };

  return (
    <View className="mb-4">
      <Text className="mb-1 text-[16px] font-bold text-black">{title}</Text>

      <Pressable onPress={toggleExpand}>
        <View className="overflow-hidden rounded-[6px] bg-white shadow-sm">
          {/* 卡片内容 */}
          <View className="bg-[#fff] rounded-[6px] p-4">
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
              <View className=" w-[120px] aspect-[120/90] rounded-[6px] bg-[#D9D9D9] overflow-hidden">
                <Image
                  source={require('~/assets/images/instructors/instructor_image.png')}
                  className="h-full w-full"
                  contentFit="cover"
                />
              </View>
            </View>

            {/* 简介部分 - 收起状态 */}
            {!expanded && (
              <Text className="mt-3 text-[12px] font-normal text-[rgba(0,0,0,0.4)]" numberOfLines={2}>
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
                  <View className="flex-row justify-between items-center">
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
                  <View className="mt-3 flex-row justify-between items-center">
                    <View />
                    <View className="flex-row items-center">
                      <Text className="text-[14px] font-bold text-[rgba(0,0,0,0.4)]">售价：</Text>
                      <Text className="text-[20px] font-bold text-[#1483FD]">{price}￥</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={isBooked ? undefined : handleReservePress}
                    className={`mt-6 self-stretch ${isBooked ? 'opacity-50' : ''}`}
                  >
                    <LinearGradient
                      colors={['#20B4F3', '#5762FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="items-center justify-center rounded-[6px] py-[14px]"
                      style={{
                        boxShadow: "0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
                      }}
                    >
                      <Text className="text-[20px] font-bold text-white">{isBooked ? '已预约' : '立即预约'}</Text>
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
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[320px] relative rounded-[12px] bg-white overflow-hidden">

            <Pressable
              onPress={() => setShowModal(false)}
              className="absolute w-6 h-6 right-2   top-2"
            >
              <Text className="text-[24px] text-black">×</Text>
            </Pressable>
            {/* 弹窗标题 */}
            <View className="w-full pt-5 p-3 items-center justify-center relative">
              <Text className="text-[18px] font-bold text-black">课程预约</Text>

            </View>

            {/* 课程图片 */}
            <View className="px-4 items-center">
              <View className="w-[272px] h-[130px] rounded-[8px] bg-gray-200 overflow-hidden">
                <Image
                  source={require('~/assets/images/instructors/instructor_image.png')}
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
            </View>

            {/* 课程信息 */}
            <View className="mt-6 mb-2 px-4 pb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-[16px] text-black">《{title}》</Text>
                <Text className="text-[18px] font-bold text-[#1483FD]">{price}￥</Text>
              </View>
            </View>

            {/* 确认按钮 */}
            <Pressable onPress={handlePayment} className="mt-1 mb-4 mx-4">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center rounded-[6px] py-[14px]"
                style={{
                  boxShadow: "0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
                }}
              >
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