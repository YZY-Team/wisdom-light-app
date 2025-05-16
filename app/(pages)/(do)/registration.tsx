import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';

cssInterop(LinearGradient, { className: 'style' });

type FormData = {
  course: string;
  courseDate: string;
  chineseName: string;
  englishName: string;
  nickname: string;
  gender: string;
  age: string;
  birthDate: string;
  phoneNumber: string;
  wechatId: string;
  availableCallTime: string;
  address: string;
  company: string;
  position: string;
  referrer: string;
  coursePrice: string;
  expectedOutcome: string;
  signature: string;
  signDate: string;
};

export default function RegistrationScreen() {
  const [formData, setFormData] = useState<FormData>({
    course: '我是一切的根源',
    courseDate: '',
    chineseName: '',
    englishName: '',
    nickname: '',
    gender: '',
    age: '',
    birthDate: '',
    phoneNumber: '',
    wechatId: '',
    availableCallTime: '',
    address: '',
    company: '',
    position: '',
    referrer: '',
    coursePrice: '',
    expectedOutcome: '',
    signature: '',
    signDate: '',
  });

  const [selectedCourse, setSelectedCourse] = useState<string>('我是一切的根源');

  const courses = [
    { id: '1', name: '我是一切的根源', number: '238' },
    { id: '2', name: '心是一切的根源', number: '' },
    { id: '3', name: '爱是一切的根源', number: '' },
    { id: '4', name: '其他Other', number: '63' },
  ];

  const formFields = [
    {
      id: 'courseDate',
      label: '课程日期：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'chineseName',
      label: '中文姓名：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'englishName',
      label: '英文姓名：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'nickname',
      label: '昵      称：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'gender',
      label: '性      别：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'age',
      label: '年      龄：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'birthDate',
      label: '出生日期：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'phoneNumber',
      label: '电话号码：',
      placeholder: '请输入...',
      keyboardType: 'phone-pad' as const,
    },
    {
      id: 'wechatId',
      label: '微  信  号：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'availableCallTime',
      label: '方便通话   时  间  ：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'address',
      label: '住       址：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'company',
      label: '单位名称：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'position',
      label: '职        位：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'referrer',
      label: '介  绍  人：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
    },
    {
      id: 'coursePrice',
      label: '课程价格：',
      placeholder: '请输入...',
      keyboardType: 'numeric' as const,
    },
    {
      id: 'expectedOutcome',
      label: '预期得到   的成果：',
      placeholder: '请输入...',
      keyboardType: 'default' as const,
      multiline: true,
      numberOfLines: 3,
    },
  ];

  const handleTextChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCourseSelect = (courseName: string) => {
    setSelectedCourse(courseName);
    handleTextChange('course', courseName);
  };

  const handleSubmit = () => {
    console.log('表单提交', formData);
    router.back();
  };

  return (
    <KeyboardAwareScrollView bottomOffset={50} className="flex-1 bg-white">
      <SafeAreaView className="flex-1 bg-[#F5F8FC]">
        {/* 顶部导航栏 */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="left" size={24} color="#00000080" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-[16px]  font-semibold">报读卡</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="p-5">
            {/* 课程选择 */}
            <View className="mb-6">
              <View className="flex-row flex-wrap gap-3 rounded-[12px] bg-white px-3 py-5">
                {courses.map((course) => (
                  <Pressable
                    key={course.id}
                    onPress={() => handleCourseSelect(course.name)}
                    className={` } rounded-[4px] px-4 py-2`}>
                    <View className="flex-row items-center">
                      <View className="mr-2 h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-[#D9D9D9]">
                        {selectedCourse === course.name && (
                          <Ionicons name="checkmark" size={16} color="#1483FD" />
                        )}
                      </View>
                      <Text className={`text-black`}>{course.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 基本信息表单 */}
            <View className="mb-6 rounded-[12px] bg-white p-5 shadow-sm">
              <View className="gap-4">
                {formFields.map((field) => (
                  <FormField
                    key={field.id}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof FormData] || ''}
                    onChangeText={(text) => handleTextChange(field.id as keyof FormData, text)}
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                    numberOfLines={field.numberOfLines}
                  />
                ))}
              </View>
            </View>

            {/* 协议部分 */}
            <View className="mb-6 rounded-[12px] bg-white p-3 shadow-sm">
              <Text className="mb-4  text-[16px] text-black">本人承诺如下：</Text>

              {[
                '参加者必须年满18周岁或以上。',
                '报读者所缴纳的所有费用仅适用于所报名的当期"智慧之光"课程，费用不可转让。如报名者在课程登记当天缺席，可延期参加课程，该延期资格自报名之日起6个月内有效。所缴费用概不退还，报名者无权追究任何责任。',
                '如报名者选择退款，必须在所报课程开课前24小时以书面形式通知中心负责人，并需扣除￥3000行政费用。扣除后的余额将在约四周内处理完毕。',
                '凡以优惠价报名课程者，如未能按时入读，需补齐差价后方可参加之后的班次。',
                '如对上述条款有任何争议，本公司保留最终解释权。',
              ].map((text, index) => (
                <View key={index} className="flex-row px-2">
                  <Text className="mr-1 text-[14px] leading-[20px] text-[#00000066]">
                    {index + 1}.
                  </Text>
                  <Text className="flex-1 text-[14px] leading-[20px] text-[#00000066]">{text}</Text>
                </View>
              ))}

              <Text className="mb-2 mt-4 text-[14px] leading-[20px] ">
                本人完全明白及同意以上5项声明，如有任何争议，智慧之光保留最终决定权。
              </Text>

              <View className="mt-2 gap-2">
                <FormField
                  label="承诺人签署确认："
                  placeholder="请输入..."
                  value={formData.signature}
                  onChangeText={(text) => handleTextChange('signature', text)}
                />

                <FormField
                  label="签署日期："
                  placeholder="请输入..."
                  value={formData.signDate}
                  onChangeText={(text) => handleTextChange('signDate', text)}
                />
              </View>
            </View>

            {/* 提交按钮 */}
            <Pressable onPress={handleSubmit} className="mb-10">
              <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center rounded-[6px] py-3"
                style={{
                  boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                }}>
                <Text className="text-[20px] font-bold text-white">提交</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

// 表单字段组件
type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
}: FormFieldProps) {
  return (
    <View className="flex-row items-center">
      <Text className="w-[80px]    text-[14px] tracking-wide text-black">{label}</Text>
      <View className="flex-1">
        <TextInput
          className="rounded-[6px] bg-[rgba(20,131,253,0.05)] px-4 py-3 text-black"
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
    </View>
  );
}
