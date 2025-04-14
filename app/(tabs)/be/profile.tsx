import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { achievementBookApi } from '~/api/be/achievementBook';
import { Alert } from 'react-native';

type FormField = {
  key: string;
  label: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
};
// 修改 splitText 函数
const splitText = (text: string): string[][] => {
  // 先找到最后的冒号位置
  const colonIndex = text.lastIndexOf(':');
  if (colonIndex === -1) return text.split('').map(char => [char]);

  // 将文本分为冒号前和冒号两部分
  const beforeColon = text.slice(0, colonIndex);
  const colon = text[colonIndex];

  const result: string[][] = [];
  let currentGroup: string[] = [];

  // 处理冒号前的文字
  for (let i = 0; i < beforeColon.length; i++) {
    currentGroup.push(beforeColon[i]);
    if (currentGroup.length === 4) {
      result.push([...currentGroup]);
      currentGroup = [];
    }
  }

  // 将剩余字符和冒号作为最后一组
  if (currentGroup.length > 0) {
    currentGroup.push(colon);
    result.push(currentGroup);
  } else {
    result[result.length - 1].push(colon);
  }

  return result;
};

export default function Profile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '张三',
    nickname: '小张',
    gender: '男',
    age: '28',
    maritalStatus: '未婚',
    childrenStatus: '无',
    phone: '13812345678',
    email: 'zhangsan@example.com',
    companyName: '智慧之光科技有限公司',
    position: '软件工程师',
    companySize: '100-500人',
    annualIncome: '30万',
    companyAddress: '北京市海淀区中关村科技园',
    emergencyContact: '李四 13987654321',
    homeAddress: '北京市朝阳区建国路88号',
  });

  const formFields: FormField[] = [
    { key: 'name', label: '姓名:' },
    { key: 'nickname', label: '称呼:' },
    { key: 'gender', label: '性别:' },
    { key: 'age', label: '年龄:', keyboardType: 'numeric' },
    { key: 'maritalStatus', label: '婚姻状况:' },
    { key: 'childrenStatus', label: '子女状况:' },
    { key: 'phone', label: '手机电话:', keyboardType: 'phone-pad' },
    { key: 'email', label: '电子邮件:', keyboardType: 'email-address' },
    { key: 'companyName', label: '公司名称:' },
    { key: 'position', label: '职位:' },
    { key: 'companyAddress', label: '公司地址:' },
    { key: 'emergencyContact', label: '紧急联系人:' },
    { key: 'homeAddress', label: '家庭地址:' },
  ];

  const handleSubmit = async () => {
    try {
      // 将个人资料转换为格式化文本
      const profileContent = Object.entries(formData)
        .filter(([_, value]) => value) // 只包含有值的字段
        .map(([key, value]) => {
          const field = formFields.find(f => f.key === key);
          return field ? `${field.label.replace(':', '')}：${value}` : null;
        })
        .filter(Boolean)
        .join('\n\n');

      // 创建成就书数据
      const achievementData = {
        title: '个人资料',
        content: profileContent,
        status: 'ACTIVE'
      };
      console.log("profileContent",profileContent);
      
      // 调用API更新成就书
      const response = await achievementBookApi.updateAchievementBook("1911671090439000066", formData);
      
      if (response.code===200) {
        Alert.alert('成功', '个人资料已保存');
        router.back();
      } else {
        Alert.alert('保存失败', response.data.message || '请稍后重试');
      }
    } catch (error) {
      console.error('保存个人资料时出错:', error);
      Alert.alert('保存失败', '请检查网络连接后重试');
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
          <Text className="flex-1 text-center text-[16px]  font-semibold">个人资料</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 可滚动的内容区域 */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-1 rounded-xl bg-white py-2">
          {formFields.map((field, index) => (
            <View key={field.key} className={` flex-row items-center `}>
              <View className="w-[60px] flex-col justify-between">
                {splitText(field.label).map((line, lineIndex) => (
                  <View key={lineIndex} className="flex-row  justify-between">
                    {line.map((char, charIndex) => (
                      <Text key={charIndex} className="text-sm ">
                        {char}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
              <TextInput
                className=" h-[40px] flex-1 bg-[#1483FD0D] px-2 text-justify text-[14px] text-base leading-normal text-[#040404]"
                placeholder="请输入..."
                placeholderTextColor="#D1D5DB"
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, [field.key]: text }))}
                keyboardType={field.keyboardType || 'default'}
                maxLength={11}
                multiline
              />
            </View>
          ))}
        </View>

        <View className="mt-20 w-full px-4">
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className=" w-full  rounded-[6px]"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Pressable className="h-[44px] items-center justify-center" onPress={handleSubmit}>
              <Text
                className="text-center text-[5.128vw] text-white"
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
