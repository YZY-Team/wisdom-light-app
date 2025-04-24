import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // 确保安装了 expo-linear-gradient

export default function VideoMeetingApply() {
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' or 'pending'

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
              />
            </View>

            {/* 添加封面 */}
            <View className="bg-white p-4 rounded-lg items-center justify-center h-40 border border-dashed border-gray-300">
              <Text className="text-gray-400">添加封面</Text>
              {/* TODO: 添加图片上传逻辑 */}
            </View>

            {/* 课程简介 */}
            <View className="bg-white p-4 rounded-lg">
              <Text className="mb-2 text-gray-700">课程简介:</Text>
              <TextInput
                placeholder="请输入..."
                multiline
                numberOfLines={4}
                className="h-24 text-base align-text-top"
                placeholderTextColor="#ccc"
                style={{ textAlignVertical: 'top' }} // 确保安卓上文字顶部对齐
              />
            </View>

            {/* 开课时间 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">开课时间:</Text>
              <TextInput
                placeholder="请选择"
                className="flex-1 text-base"
                placeholderTextColor="#ccc"
              />
            </View>

            {/* 可预约人数 */}
            <View className="flex-row items-center bg-white p-4 rounded-lg">
              <Text className="w-20 text-gray-700">可预约人数:</Text>
              <TextInput
                placeholder="请输入"
                className="flex-1 text-base"
                keyboardType="numeric"
                placeholderTextColor="#ccc"
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
          <Pressable onPress={() => { /* TODO: 处理提交逻辑 */ }}>
            <LinearGradient
              colors={['#66a6ff', '#3f8eff']} // 示例渐变色
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