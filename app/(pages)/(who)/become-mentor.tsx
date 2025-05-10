import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tutorApi } from '~/api/who/tutor';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });

export default function ApplySettlementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    teamPillars: '',
    personalPillars: '',
    achievement: '',
    invitation: '',
    service: '',
  });

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

  // 处理提交
  const handleSubmit = async () => {
    try {
      const payload = {
        userId: 0,
        realName: formData.name,
        specialization: formData.platform,
        qualificationUrls: formData.code,
        introduction: formData.oath,
        teachingYears: Number(formData.teachingExperience),
        contactPhone: formData.phone,
        contactEmail: formData.email,
        applyReason: formData.vision,
      };
      await tutorApi.submitApplication(payload);
      Alert.alert('申请提交成功');
      router.back();
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
  ];

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={50} className="flex-1"  behavior={'padding'} style={{ flex: 1 }}>
      {/* 顶部导航栏 */}
      <View className="bg-[#FFFFFFCC] px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px]">提交入驻申请</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView
        className="flex-1 bg-[#F5F8FC] px-4 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom + 20 : 20 }}>
        <View className="rounded-lg">
          {/* 基本信息字段 */}
          <View className="gap-2 px-3">
            {formFields.map((field) => (
              <View key={field.key} className="h-[40px] flex-row items-center">
                {renderLabel(field.label)}
                <TextInput
                  className="h-[40px] flex-1 rounded-[6px] bg-white px-3 text-[14px] text-black"
                  placeholder="请输入..."
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData[field.key as keyof typeof formData]}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, [field.key]: text }))}
                />
              </View>
            ))}
          </View>

          {/* 团队和个人数据字段 */}
          {/* {pillarFields.map((field) => (
            <View key={field.key} className="mt-2">
              <Text className="text-[14px] text-[#040404] mb-2">{field.label}</Text>
              <TextInput
                className="min-h-[100px] bg-white px-3 py-2 text-[14px] text-black rounded-[6px] border border-[#1483FD0D]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                textAlignVertical="top"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
              />
            </View>
          ))} */}

          {/* 团队和个人数据字段 */}
          {/* <Text className="text-[14px] text-[#040404] mt-2">三大支柱数据：（百分比，不保留小数）</Text>
          <View className='gap-2 mt-1'>{achievementFields.map((field) => (
            <View key={field.key} className="flex-row items-center h-[40px]">
              <Text className="w-[80px] text-[14px] text-[rgba(4,4,4,0.4)]">{field.label}</Text>
              <TextInput
                className="flex-1 h-[40px] bg-white px-3 text-[14px] text-black rounded-[6px] border border-[#1483FD0D]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
              />
            </View>
          ))}</View> */}

          {/* 提交按钮 - 现在放在滚动区域内 */}
          <View className="mb-10 mt-8">
            <TouchableOpacity onPress={handleSubmit} disabled={!isFormComplete()}>
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-[50px] items-center justify-center rounded-[6px]"
                style={{
                  boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                  opacity: isFormComplete() ? 1 : 0.5,
                }}>
                <Text className="text-[18px] font-bold text-white">提交</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
