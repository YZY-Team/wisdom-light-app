import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { tutorApi } from '~/api/who/tutor';
import { useQuery } from '@tanstack/react-query';

cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

enum TeacherCategory {
  CHIEF = '首席导师',
  MENTOR = '导师',
  HEAD_COACH = '总教练',
  COACH_TEAM = '教练团长',
  COACH = '教练',
  COMPANY_TEAM = '公司团队',
}

// 接口返回的导师数据类型
interface ApiTeacher {
  relationId: string | null;
  tutorId: string;
  studentId: string | null;
  status: string | null;
  joinTime: string | null;
  createTime: string | null;
  updateTime: string | null;
  tutorAvatarUrl: string | null;
  tutorNickname: string;
  tutorType: string;
  specialization: string;
  teachingExperience: string | null;
  introduction: string | null;
  studentAvatarUrl: string | null;
  studentNickname: string | null;
}

// API分页返回数据类型
interface ApiResponse {
  records: ApiTeacher[];
  total: string;
  size: string;
  current: string;
  pages: string;
}

// 前端使用的导师数据类型
type Teacher = {
  id: string;
  name: string;
  role: string;
  avatar: any;
  rating: number;
  platform: string;
  description: string;
  studentCount: number;
  expertise: string[];
  category: TeacherCategory;
  specialization: string;
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
        <Image 
          source={teacher.avatar ? { uri: teacher.avatar } : require('~/assets/default-avatar.png')} 
          className="h-12 w-12 rounded-full" 
          contentFit="cover" 
        />
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

      <Text className="mt-2 text-[14px] text-black/60">{teacher.description || '暂无介绍'}</Text>

      <View className="mt-2 rounded-[6px] bg-[rgba(20,131,253,0.05)] p-2">
        <View className="flex-row">
          <Text className="text-[14px] text-black/40">过往支持学员数：</Text>
          <Text className="text-[14px] text-black">{teacher.studentCount}</Text>
        </View>
        <Text className="text-[14px] text-black/40">专业领域：{teacher.specialization || '未设置'}</Text>
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
              <Image source={require('~/assets/close.png')} className="h-4 w-4" />
            </Pressable>
          </View>

          {/* 导师信息 */}
          <View className="mt-4 flex-row items-center justify-center p-4">
            <Image 
              source={teacher.avatar ? { uri: teacher.avatar } : require('~/assets/default-avatar.png')} 
              className="h-14 w-14 rounded-full" 
              contentFit="cover" 
            />
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

          {/* 支付按钮 - 测试阶段直接绑定导师 */}
          <Pressable onPress={onPayment} className="mx-4 mb-4 mt-6">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="items-center justify-center rounded-[6px] py-3">
              <Text className="text-[20px] font-bold text-white">绑定导师</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// 结果提示模态框
type ResultModalProps = {
  visible: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
};

const ResultModal = ({ visible, success, message, onClose }: ResultModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-[320px] overflow-hidden rounded-[12px] bg-white p-6">
          <View className="items-center justify-center">
            <Ionicons 
              name={success ? "checkmark-circle" : "close-circle"} 
              size={50} 
              color={success ? "#4CAF50" : "#F44336"} 
            />
            <Text className="mt-4 text-center text-lg font-medium">
              {success ? "操作成功" : "操作失败"}
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600">
              {message}
            </Text>
          </View>
          <Pressable onPress={onClose} className="mt-6">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="items-center justify-center rounded-[6px] py-3">
              <Text className="text-[16px] font-bold text-white">确定</Text>
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
  const [isBinding, setIsBinding] = useState(false);
  
  // 结果提示模态框状态
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  
  // 使用React Query获取导师列表
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['tutors', activeCategory],
    queryFn: async () => {
      const params = {
        current: '1',
        size: '10',
        tutorType: activeCategory
      };
      
      const response = await tutorApi.getAvailableTutors(params);
      
      if (response && response.data) {
        const apiResponse = response.data as ApiResponse;
        
        if (apiResponse.records && Array.isArray(apiResponse.records)) {
          // 将API返回的数据转换为前端使用的格式
          return apiResponse.records.map((item: ApiTeacher) => ({
            id: item.tutorId,
            name: item.tutorNickname,
            role: item.tutorType,
            avatar: item.tutorAvatarUrl,
            rating: 5.0, // 默认评分
            platform: '',
            description: item.introduction || '',
            studentCount: 0, // 默认学员数
            expertise: [],
            category: item.tutorType as TeacherCategory,
            specialization: item.specialization || ''
          }));
        }
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  const teachers = teachersData || [];

  console.log('teachers', teachers);
  const prices = {
    '1月': 99,
    '1季': 199,
    '1年': 299,
  };

  const handleConsultPress = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowConsultModal(true);
  };

  // 修改为调用绑定导师API
  const handlePayment = async () => {
    if (!selectedTeacher) return;
    
    setIsBinding(true);
    try {
      // 调用绑定导师API
      const response = await tutorApi.bindTutor(selectedTeacher.id);
      
      console.log('response', response);
      // 处理成功响应
      if (response && response.code === 200) {
        setResultSuccess(true);
        setResultMessage(`您已成功绑定导师: ${selectedTeacher.name}`);
      } else {
        // 处理错误响应
        setResultSuccess(false);
        setResultMessage(response?.message || '绑定失败，请稍后再试');
      }
    } catch (error) {
      console.error('绑定导师失败:', error);
      setResultSuccess(false);
      setResultMessage('网络错误，请稍后再试');
    } finally {
      setIsBinding(false);
      setShowConsultModal(false);
      setShowResultModal(true);
    }
  };

  return (
    <View className="flex-1 ">
      {/* 顶部导航栏 */}
      <View className="flex-row items-center px-4 py-3 ">
        <Pressable onPress={() => router.back()} className="absolute z-10 left-4">
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
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">加载中...</Text>
            </View>
          ) : teachers.length > 0 ? (
            teachers.map((teacher, index) => (
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
      
      {/* 结果提示模态框 */}
      <ResultModal
        visible={showResultModal}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setShowResultModal(false)}
      />
    </View>
  );
}
