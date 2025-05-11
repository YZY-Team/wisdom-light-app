import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // 确保安装了 expo-linear-gradient
import { applyCourseOnline } from '~/api/do/course';
import * as ImagePicker from 'expo-image-picker';
import { fileApi } from '~/api/who/file';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function VideoMeetingApply() {
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' or 'pending'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '前端开发进阶课程',
    teacherName: '黄老师',
    teacherLevel: '高级讲师',
    graduationPlatform: 'React Native平台',
    coverUrl: '',
    description: '本课程将深入讲解前端开发的进阶知识，包括但不限于：\n1. React Native开发实战\n2. 性能优化技巧\n3. 状态管理最佳实践\n4. 跨平台开发经验分享',
    startTime: '2025-05-14T12:34:56Z',
    price: '299',
    maxStudents: '30'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    handleInputChange('startTime', date.toISOString());
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handlePickImage = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', '需要访问相册权限才能选择图片');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        // 准备上传的文件对象
        const fileToUpload = {
          uri: selectedAsset.uri,
          type: 'image/jpeg',
          name: 'cover.jpg',
        };

        // 上传图片
        const uploadResult = await fileApi.uploadImage({
          relatedId: new Date().getTime().toString(), // 这里可能需要根据实际业务调整
          file: fileToUpload,
        });
        console.log("uploadResult",uploadResult);
        
        // 更新表单数据
        if (uploadResult?.data?.url) {
          handleInputChange('coverUrl', uploadResult.data.url);
        }
      }
    } catch (error) {
      Alert.alert('错误', '图片上传失败，请重试');
      console.error('Image upload error:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      // 表单验证
      if (!formData.title || !formData.teacherName || !formData.description || !formData.startTime || !formData.price || !formData.coverUrl) {
        Alert.alert('提示', '请填写必要信息');
        return;
      }

      const params = {
        title: formData.title,
        teacherName: formData.teacherName,
        teacherLevel: formData.teacherLevel,
        graduationPlatform: formData.graduationPlatform,
        coverUrl: formData.coverUrl,
        description: formData.description,
        startTime: formData.startTime,
        price: Number(formData.price)
      };

      const res = await applyCourseOnline(params);
      if (res.code === 200) {
        Alert.alert('成功', '申请已提交', [
          {
            text: '确定',
          onPress: () => {
            router.back();
          },
        },
      ]);
      } else {
        // @ts-expect-error 类型错误
        Alert.alert(res.error);
      }
    } catch (error) {
      Alert.alert('错误', '提交失败，请重试');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* 导航栏 */}
      <View className="bg-white flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="absolute z-10 left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">视频会议</Text>
      </View>

      {/* Tab 导航 */}
      <View className="flex-row bg-white px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => setActiveTab('apply')} className="flex-1 items-center">
          <Text className={`text-base ${activeTab === 'apply' ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>发起申请</Text>
          {activeTab === 'apply' && <View className="h-0.5 w-6 bg-blue-500 mt-1" />}
        </Pressable>
        <Pressable onPress={() => setActiveTab('pending')} className="flex-1 items-center">
          <Text className={`text-base ${activeTab === 'pending' ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>待开课</Text>
          {activeTab === 'pending' && <View className="h-0.5 w-6 bg-blue-500 mt-1" />}
        </Pressable>
      </View>

      {/* 内容区域 */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        {activeTab === 'apply' && (
          <View className="p-4 space-y-4">
            {/* 课程名 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">课程名:</Text>
              <TextInput
                placeholder="请输入..."
                className="flex-1 text-base"
                placeholderTextColor="#ccc"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
              />
            </View>

            {/* 教师姓名 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">教师姓名:</Text>
              <TextInput
                placeholder="请输入..."
                className="flex-1 text-base"
                placeholderTextColor="#ccc"
                value={formData.teacherName}
                onChangeText={(value) => handleInputChange('teacherName', value)}
              />
            </View>

            {/* 教师级别 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">教师级别:</Text>
              <TextInput
                placeholder="请输入..."
                className="flex-1 text-base"
                placeholderTextColor="#ccc"
                value={formData.teacherLevel}
                onChangeText={(value) => handleInputChange('teacherLevel', value)}
              />
            </View>

            {/* 毕业平台 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">毕业平台:</Text>
              <TextInput
                placeholder="请输入..."
                className="flex-1 text-base"
                placeholderTextColor="#ccc"
                value={formData.graduationPlatform}
                onChangeText={(value) => handleInputChange('graduationPlatform', value)}
              />
            </View>

            {/* 修改封面上传部分 */}
            <Pressable 
              onPress={handlePickImage}
              className="bg-white p-4 rounded-lg items-center justify-center h-40 border border-dashed border-gray-300"
            >
              {formData.coverUrl ? (
                <Image 
                  source={{ uri: formData.coverUrl }} 
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons name="image-outline" size={32} color="#999" />
                  <Text className="text-gray-400 mt-2">点击添加封面</Text>
                </View>
              )}
            </Pressable>

            {/* 课程简介 */}
            <View className="bg-white p-4 rounded-lg">
              <Text className="mb-2 text-gray-700">课程简介:</Text>
              <TextInput
                placeholder="请输入..."
                multiline
                numberOfLines={4}
                className="h-24 text-base align-text-top"
                placeholderTextColor="#ccc"
                style={{ textAlignVertical: 'top' }}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
              />
            </View>

            {/* 开课时间 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">开课时间:</Text>
              <Pressable 
                onPress={() => setShowDatePicker(true)}
                className="flex-1"
              >
                <Text className="text-base">
                  {new Date(formData.startTime).toLocaleString('zh-CN')}
                </Text>
              </Pressable>
            </View>

            {/* 日期选择器 */}
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="datetime"
              onConfirm={handleDateConfirm}
              onCancel={handleDateCancel}
              date={new Date(formData.startTime)}
            />

            {/* 可预约人数 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">可预约人数:</Text>
              <TextInput
                placeholder="请输入"
                className="flex-1 text-base"
                keyboardType="numeric"
                placeholderTextColor="#ccc"
                value={formData.maxStudents}
                onChangeText={(value) => handleInputChange('maxStudents', value)}
              />
            </View>

            {/* 课程价格 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">课程价格:</Text>
              <TextInput
                placeholder="请输入"
                className="flex-1 text-base"
                keyboardType="numeric"
                placeholderTextColor="#ccc"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
              />
            </View>
          </View>
        )}

        {activeTab === 'pending' && (
          <View className="p-4 items-center justify-center">
            <Text className="text-gray-500">待开课列表</Text>
            {/* TODO: 实现待开课列表 */}
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      {activeTab === 'apply' && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50">
          <Pressable onPress={handleSubmit}>
            <LinearGradient
              colors={['#66a6ff', '#3f8eff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-lg py-3"
            >
              <Text className="text-white text-center text-lg font-medium">发起申请</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </View>
  );
}