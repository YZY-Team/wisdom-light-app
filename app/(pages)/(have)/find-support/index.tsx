import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { router } from 'expo-router';

cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

enum TeacherCategory {
  CHIEF = '首席导师',
  MENTOR = '导师',
  HEAD_COACH = '总教练',
  COACH_TEAM = '教练团队',
  COACH = '教练',
  COMPANY_TEAM = '公司团队',
}

type Teacher = {
  name: string;
  role: string;
  avatar: any;
  rating: number;
  platform: string;
  description: string;
  studentCount: number;
  expertise: string[];
  category: TeacherCategory;
};

type TeacherItemProps = {
  teacher: Teacher;
  onConsult: (teacher: Teacher) => void;
};

// 导师Item组件
const TeacherItem = ({ teacher, onConsult }: TeacherItemProps) => {
  return (
    <View className="mb-3 rounded-[12px] bg-[#fff] p-4 shadow-sm">
      <View className="flex-row">
        <Image source={teacher.avatar} className="h-12 w-12 rounded-full" contentFit="cover" />
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold">{teacher.name}</Text>
          <View className="flex-row items-center">
            <View className="rounded-[4px] bg-[rgba(241,131,24,0.1)] px-[5px] py-[2px]">
              <Text className="text-[12px] text-[#F18318]">{teacher.role}</Text>
            </View>

            <View className="ml-2 flex-row items-center">
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text className="ml-1 text-[12px]">{teacher.rating}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => onConsult(teacher)}>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-[70px] items-center justify-center rounded-[6px] px-[5px] py-[5px]">
            <Text className="text-[16px] font-bold text-white">咨询</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Text className="mt-2 text-[14px] text-black/60">{teacher.description}</Text>

      <View className="mt-2 flex-row flex-wrap">
        {teacher.expertise.map((skill, i) => (
          <View key={i} className="mb-2 mr-2 rounded-full bg-[#F5F6FA] px-3 py-1">
            <Text className="text-[12px] text-black/60">{skill}</Text>
          </View>
        ))}
      </View>

      <View className="mt-2 rounded-[6px] bg-[rgba(20,131,253,0.05)] p-2">
        <View className="flex-row">
          <Text className="text-[14px] text-black/40">过往支持学员数：</Text>
          <Text className="text-[14px] text-black">{teacher.studentCount}</Text>
        </View>
        <Text className="text-[14px] text-black/40">毕业平台：{teacher.platform}</Text>
      </View>
    </View>
  );
};

// 咨询弹窗组件
type ConsultModalProps = {
  visible: boolean;
  teacher: Teacher | null;
  selectedPlan: string;
  prices: Record<string, number>;
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
  onPayment: () => void;
};

const ConsultModal = ({
  visible,
  teacher,
  selectedPlan,
  prices,
  onClose,
  onSelectPlan,
  onPayment,
}: ConsultModalProps) => {
  if (!teacher) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-[320px] overflow-hidden rounded-[12px] bg-white">
          {/* 关闭按钮 */}
          <View className="absolute right-4 top-4 z-10">
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </Pressable>
          </View>

          {/* 导师信息 */}
          <View className="mt-4 flex-row items-center justify-center p-4">
            <Image source={teacher.avatar} className="h-14 w-14 rounded-full" contentFit="cover" />
            <View className="ml-4">
              <Text className="text-[18px] font-bold">{teacher.name}</Text>
              <View className="mt-1 rounded-[4px] bg-[rgba(241,131,24,0.1)] px-[5px] py-[2px]">
                <Text className="text-[12px] text-[#F18318]">{teacher.role}</Text>
              </View>
            </View>
          </View>

          {/* 套餐选择 */}
          <View className="mt-4 gap-2 px-7">
            {Object.keys(prices).map((plan) => (
              <Pressable
                key={plan}
                onPress={() => onSelectPlan(plan)}
                className={`flex-row items-center justify-between rounded-[6px] bg-[#1483FD0D] px-4 py-3 ${
                  selectedPlan === plan ? 'border border-[#1483FD]' : ''
                }`}>
                <Text className="text-[16px]">{plan}</Text>
                <Text
                  className={`${
                    plan === '1月'
                      ? 'text-[#000]'
                      : plan === '1季'
                        ? 'text-[#1483FD]'
                        : 'text-[#F18318]'
                  } text-[20px] font-bold`}>
                  {prices[plan]}￥
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 支付按钮 */}
          <Pressable onPress={onPayment} className="mx-4 mb-4 mt-6">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="items-center justify-center rounded-[6px] py-3">
              <Text className="text-[20px] font-bold text-white">支付</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default function FindSupport() {
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('1月');
  const [activeCategory, setActiveCategory] = useState<TeacherCategory>(TeacherCategory.CHIEF);

  const teachers: Teacher[] = [
    {
      name: '番号A123+导师名字',
      role: '首席导师',
      avatar: require('~/assets/images/courses/wisdom_light_image.png'),
      rating: 4.9,
      platform: 'XXXXXX',
      description: '学习如何培养成功者思维方式，建立正确的成功观念',
      studentCount: 1025,
      expertise: ['青少年指导', '情感问题', '职业规划'],
      category: TeacherCategory.CHIEF,
    },
    {
      name: '番号B456+导师名字',
      role: '导师',
      avatar: require('~/assets/images/courses/wisdom_light_image.png'),
      rating: 4.8,
      platform: 'XXXXXX',
      description: '专注于情感心理辅导，帮助你建立健康的人际关系',
      studentCount: 895,
      expertise: ['情感关系', '亲子沟通', '人际交往'],
      category: TeacherCategory.MENTOR,
    },
    {
      name: '番号C789+导师名字',
      role: '总教练',
      avatar: require('~/assets/images/courses/wisdom_light_image.png'),
      rating: 5.0,
      platform: 'XXXXXX',
      description: '职业规划与个人成长专家，助你找到职业方向',
      studentCount: 1230,
      expertise: ['职业发展', '生涯规划', '自我提升'],
      category: TeacherCategory.HEAD_COACH,
    },
    {
      name: '番号D101+导师名字',
      role: '教练',
      avatar: require('~/assets/images/courses/wisdom_light_image.png'),
      rating: 4.7,
      platform: 'XXXXXX',
      description: '专注健康生活和心理调适，帮助你平衡生活与工作',
      studentCount: 780,
      expertise: ['健康生活', '压力管理', '情绪调节'],
      category: TeacherCategory.COACH,
    },
  ];

  const prices = {
    '1月': 99,
    '1季': 199,
    '1年': 299,
  };

  const handleConsultPress = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowConsultModal(true);
  };

  const handlePayment = () => {
    console.log('支付咨询费用', selectedPlan, selectedTeacher?.name);
    setShowConsultModal(false);
  };

  const filteredTeachers = teachers.filter((teacher) => teacher.category === activeCategory);

  return (
    <View className="flex-1 ">
      {/* 顶部导航栏 */}
      <View className="flex-row items-center px-4 py-3 ">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">寻找支持</Text>
      </View>

      {/* 横向滚动的分类标签 */}
      <View className="mt-2 px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.values(TeacherCategory).map((category) => (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              className={`mr-2 overflow-hidden ${
                activeCategory === category ? '' : ' border border-[#1483FD] '
              }`}
              style={{
                borderRadius: 6,
                height: 34,
                boxShadow:
                  activeCategory === category ? '0px 10px 6px 0px rgba(20, 131, 253, 0.4)' : 'none',
              }}>
              {activeCategory === category ? (
                <LinearGradient
                  colors={['#20B4F3', '#5762FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-full justify-center px-4">
                  <Text className={`font-medium text-white`}>{category}</Text>
                </LinearGradient>
              ) : (
                <View className="h-full justify-center px-4">
                  <Text className="font-medium text-[#1483FD]">{category}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView>
        <View className="p-4">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher, index) => (
              <TeacherItem key={index} teacher={teacher} onConsult={handleConsultPress} />
            ))
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">该分类下暂无导师</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 咨询弹窗 */}
      <ConsultModal
        visible={showConsultModal}
        teacher={selectedTeacher}
        selectedPlan={selectedPlan}
        prices={prices}
        onClose={() => setShowConsultModal(false)}
        onSelectPlan={setSelectedPlan}
        onPayment={handlePayment}
      />
    </View>
  );
}
