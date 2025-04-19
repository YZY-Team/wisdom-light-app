import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    service: ''
  });

  // 渲染文本框标签
  const renderLabel = (label: string) => {
    if (label.includes('：')) {
      return (
        <Text className="w-[90px] text-[14px] text-[#040404]">{label}</Text>
      );
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

    return (
      <Text className="w-[90px] text-[14px] text-[#040404]">{label}</Text>
    );
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
    { key: 'coachingExperience', label: '做过几次教练：' }
  ];

  // 团队和个人数据字段
  const pillarFields = [
    { key: 'teamPillars', label: '带的团队三大支柱数据：（带了几班填几班数据）' },
    { key: 'personalPillars', label: '个人再走时三大支柱数据：' },
  ];

  // 三大支柱数据字段
  const achievementFields = [
    { key: 'achievement', label: '个人成就：' },
    { key: 'invitation', label: '感        召：' },
    { key: 'service', label: ' 社        服:' }
  ];

  return (
    <View className="flex-1 bg-white">
      {/* 顶部导航栏 */}
      <View className="px-4 py-4" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px]">申请入驻</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 顶部标签栏 */}
      <View className="bg-[#1483FD] px-4 py-2">
        <View className="flex-row items-center space-x-8">
          <Text className="text-white font-bold">提交入驻申请</Text>
          <Text className="text-white opacity-50">学员管理</Text>
          <Text className="text-black opacity-50">我的收入</Text>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView 
        className="flex-1 px-4 py-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="rounded-lg bg-white space-y-4">
          {/* 基本信息字段 */}
          {formFields.map((field) => (
            <View key={field.key} className="flex-row items-center h-[40px]">
              {renderLabel(field.label)}
              <TextInput
                className="flex-1 h-[40px] bg-[#1483FD0D] px-3 text-[14px] text-black rounded-[6px]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
                style={{
                  shadowColor: 'rgba(0, 0, 0, 0.05)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
            </View>
          ))}

          {/* 团队和个人数据字段 */}
          <Text className="text-[14px] text-[#040404] mt-4">三大支柱数据：（百分比，不保留小数）</Text>
          {achievementFields.map((field) => (
            <View key={field.key} className="flex-row items-center h-[40px]">
              <Text className="w-[90px] text-[14px] text-[rgba(4,4,4,0.4)]">{field.label}</Text>
              <TextInput
                className="flex-1 h-[40px] bg-white px-3 text-[14px] text-black rounded-[6px] border border-[#1483FD0D]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
                style={{
                  shadowColor: 'rgba(0, 0, 0, 0.05)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
            </View>
          ))}

          {/* 团队和个人数据字段 */}
          {pillarFields.map((field) => (
            <View key={field.key} className="mt-4">
              <Text className="text-[14px] text-[#040404] mb-2">{field.label}</Text>
              <TextInput
                className="min-h-[100px] bg-white px-3 py-2 text-[14px] text-black rounded-[6px] border border-[#1483FD0D]"
                placeholder="请输入..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                multiline
                textAlignVertical="top"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
                style={{
                  shadowColor: 'rgba(0, 0, 0, 0.05)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 提交按钮 */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-4 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={() => {
            // 提交逻辑
            console.log('提交表单', formData);
          }}
        >
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-[6px] h-[50px] justify-center items-center"
            style={{
              shadowColor: 'rgba(20, 131, 253, 0.4)',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text className="text-white text-[18px] font-bold">提交</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
} 