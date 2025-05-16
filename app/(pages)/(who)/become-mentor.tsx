import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { cssInterop } from 'nativewind';
import { tutorApi, TutorApplicationParams } from '~/api/who/tutor';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '~/store/userStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '~/utils/request';
import { TutorData } from '~/app/api/who/tutor';
import { format } from 'date-fns';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });

// 导师类型枚举
enum TutorType {
  CHIEF = '首席导师',
  MENTOR = '导师',
  HEAD_COACH = '总教练',
  COACH_TEAM = '教练团长',
  COACH = '教练',
}

export default function ApplySettlementScreen() {
  const router = useRouter();
  const { data: currentTutor } = useQuery({
    queryKey: ['currentTutor'],
    queryFn: () => tutorApi.getCurrentTutor(),
  });
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    wechat: '',
    phone: '',
    email: '',
    company: '',
    platform: '',
    code: '',
    occupation: '',
    address: '',
    oath: '',
    vision: '',
    teamSize: '',
    teachingExperience: '',
    coachingExperience: '',
    tutorType: '',
  });
  // 下拉框状态
  const [showTutorTypeDropdown, setShowTutorTypeDropdown] = useState(false);
  
  useEffect(() => {
    if (currentTutor?.data) {
      setFormData({
        name: currentTutor.data.name || '',
        age: currentTutor.data.age?.toString() || '',
        gender: currentTutor.data.gender || '',
        wechat: currentTutor.data.wechat || '',
        phone: currentTutor.data.phone || '',
        email: currentTutor.data.email || '',
        company: currentTutor.data.companyName || '',
        platform: currentTutor.data.platform || '',
        code: currentTutor.data.serialNumber || '',
        occupation: currentTutor.data.profession || '',
        address: currentTutor.data.homeAddress || '',
        oath: currentTutor.data.oath || '',
        vision: currentTutor.data.vision || '',
        teamSize: currentTutor.data.teamSize?.toString() || '',
        teachingExperience: currentTutor.data.assistantCount?.toString() || '',
        coachingExperience: currentTutor.data.coachCount?.toString() || '',
        tutorType: currentTutor.data.tutorType || '',
      });
    }
  }, [currentTutor]);
  // 检查所有必填字段是否已填写
  const isFormComplete = () => {
    // 检查基本信息字段
    for (const field of formFields) {
      if (!formData[field.key as keyof typeof formData]) {
        return false;
      }
    }
    return true;
  };
  const userInfo = useUserStore((state) => state.userInfo);
  // 处理提交
  const handleSubmit = async () => {
    try {
      const payload: TutorApplicationParams = {
        userId: userInfo ? userInfo.globalUserId : '',
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        wechat: formData.wechat,
        phone: formData.phone,
        email: formData.email,
        companyName: formData.company,
        platform: formData.platform,
        serialNumber: formData.code,
        profession: formData.occupation,
        homeAddress: formData.address,
        oath: formData.oath,
        vision: formData.vision,
        teamSize: Number(formData.teamSize),
        assistantCount: Number(formData.teachingExperience),
        coachCount: Number(formData.coachingExperience),
        tutorType: formData.tutorType,
      };
      const res = await tutorApi.submitApplication(payload);
      if (res.code === 200) {
        Alert.alert('申请提交成功');
        queryClient.invalidateQueries({ queryKey: ['currentTutor'] });
      } else {
        Alert.alert('提交失败', res.message || '请稍后重试');
      }
    } catch (error: any) {
      Alert.alert('提交失败', error.message || '请稍后重试');
    }
  };

  // 渲染文本框标签
  const renderLabel = (label: string) => {
    if (label.includes('：')) {
      return <Text className="w-[80px] text-[14px] text-[#040404]">{label}</Text>;
    }

    // 对于像"姓 名："这样的标签，我们需要特殊处理
    const parts = label.split(' ');
    if (parts.length === 2) {
      return (
        <View className="w-[60px] flex-row items-center justify-between">
          <Text className="text-[14px] text-[#040404]">{parts[0]}</Text>
          <Text className="text-[14px] text-[#040404]">{parts[1]}</Text>
        </View>
      );
    }

    return <Text className="w-[90px] text-[14px] text-[#040404]">{label}</Text>;
  };

  // 表单字段配置
  const formFields = [
    { key: 'name', label: '姓        名：' },
    { key: 'age', label: '年        龄：' },
    { key: 'gender', label: '性        别：' },
    { key: 'wechat', label: '微        信：' },
    { key: 'phone', label: '手机电话：' },
    { key: 'email', label: '电子邮件：' },
    { key: 'company', label: '公司名称：' },
    { key: 'platform', label: '平        台：' },
    { key: 'code', label: '番        号：' },
    { key: 'occupation', label: '职        业：' },
    { key: 'address', label: '家庭地址：' },
    { key: 'oath', label: '约        誓：' },
    { key: 'vision', label: '愿        景：' },
    { key: 'teamSize', label: '原生团队人数：' },
    { key: 'teachingExperience', label: '做过几次助教：' },
    { key: 'coachingExperience', label: '做过几次教练：' },
    { key: 'tutorType', label: '导师类型：' },
  ];

  console.log("判断申请状态",currentTutor?.data?.status);
  
  // 判断申请状态
  const isRejected = currentTutor?.data?.status === 'REJECTED';
  const isPending = currentTutor?.data?.status === 'PENDING';
  const isCanceled = currentTutor?.data?.status === 'CANCELED';
  const isSubmitted = !!currentTutor?.data && !isRejected && !isCanceled;
  const formattedReviewTime = currentTutor?.data?.reviewTime
    ? format(new Date(currentTutor.data.reviewTime), 'yyyy-MM-dd HH:mm:ss')
    : '';

  // 处理取消申请
  const handleCancelApplication = async () => {
    if (!currentTutor?.data?.applicationId) return;
    
    Alert.alert(
      '确认取消',
      '确定要取消此申请吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const res = await tutorApi.cancelApplication(currentTutor.data.applicationId);
              if (res.code === 200) {
                Alert.alert('取消成功');
                queryClient.invalidateQueries({ queryKey: ['currentTutor'] });
              } else {
                Alert.alert('操作失败', res.message || '请稍后重试');
              }
            } catch (error: any) {
              Alert.alert('操作失败', error.message || '请稍后重试');
            }
          }
        }
      ]
    );
  };

  // 选择导师类型
  const handleSelectTutorType = (type: string) => {
    setFormData(prev => ({ ...prev, tutorType: type }));
    setShowTutorTypeDropdown(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-[#F5F8FC]">
        {/* 顶部导航栏 */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="left" size={24} color="#00000080" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-[16px] font-semibold">提交入驻申请</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="p-5">
            {/* 拒绝原因显示 */}
            {isRejected && currentTutor?.data?.reviewComment && (
              <View className="mb-4 rounded-[12px] bg-[#FFF2F2] p-4">
                <View className="flex-row items-center">
                  <Text className="text-[16px] font-semibold text-[#E53935]">申请被拒绝</Text>
                  {formattedReviewTime && (
                    <Text className="ml-2 text-[12px] text-[#E53935]">
                      （{formattedReviewTime}）
                    </Text>
                  )}
                </View>
                <Text className="mt-2 text-[14px] text-[#E53935]">
                  拒绝原因：{currentTutor.data.reviewComment}
                </Text>
              </View>
            )}

            {/* 基本信息字段 */}
            <View className="rounded-[12px] bg-white p-5 shadow-sm">
              <View className="gap-4">
                {formFields.map((field) => (
                  <View key={field.key} className="flex-row items-center">
                    {renderLabel(field.label)}
                    <View className="flex-1">
                      {field.key === 'tutorType' ? (
                        <View className="relative">
                          <TouchableOpacity
                            onPress={() => !isSubmitted && !isPending && setShowTutorTypeDropdown(!showTutorTypeDropdown)}
                            className="rounded-[6px] bg-[rgba(20,131,253,0.05)] px-4 py-3"
                            disabled={isSubmitted || isPending}>
                            <View className="flex-row items-center justify-between">
                              <Text className={formData.tutorType ? "text-black" : "text-black/50"}>
                                {formData.tutorType || `请选择导师类型...`}
                              </Text>
                              <AntDesign name="down" size={16} color="rgba(0, 0, 0, 0.5)" />
                            </View>
                          </TouchableOpacity>
                          
                          {showTutorTypeDropdown && (
                            <View className="absolute -top-[200px] z-10 w-full rounded-[6px] bg-white shadow-lg">
                              {Object.values(TutorType).map((type) => (
                                <TouchableOpacity
                                  key={type}
                                  onPress={() => handleSelectTutorType(type)}
                                  className="border-b border-[#F5F5F5] p-3">
                                  <Text className="text-[14px]">{type}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      ) : (
                        <TextInput
                          className="rounded-[6px] bg-[rgba(20,131,253,0.05)] px-4 py-3 text-black"
                          placeholder={`请输入${field.label.replace(/\s+/g, '').replace('：', '')}...`}
                          placeholderTextColor="rgba(0, 0, 0, 0.5)"
                          value={formData[field.key as keyof typeof formData]}
                          onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, [field.key]: text }))
                          }
                          editable={!isSubmitted && !isPending} // 如果已提交且未被拒绝或取消，或者处于pending状态，则不可编辑
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitted || !isFormComplete()}
              className="mb-4 mt-8">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center rounded-[6px] py-3"
                style={{
                  opacity: !isSubmitted && isFormComplete() ? 1 : 0.5,
                }}>
                <Text className="text-[20px] font-bold text-white">
                  {isSubmitted ? '已提交申请' : (isRejected || isCanceled) ? '重新提交' : '提交'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 取消申请按钮 */}
            {isPending && (
              <TouchableOpacity
                onPress={handleCancelApplication}
                className="mb-10">
                <View className="items-center justify-center rounded-[6px] border border-[#E53935] py-3">
                  <Text className="text-[16px] font-medium text-[#E53935]">
                    取消申请
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
