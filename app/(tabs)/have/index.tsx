import { Href, Link } from 'expo-router';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
cssInterop(Image, { className: 'style' });

type MessageProps = {
  avatar: string;
  name: string;
  message: string;
  time: string;
  isMe?: boolean;
};

const Message = ({ avatar, name, message, time, isMe = false }: MessageProps) => (
  <View className={`mb-4 flex-row ${isMe ? 'flex-row-reverse' : ''}`}>
    <Image source={{ uri: avatar }} className="h-8 w-8 rounded-full" />
    <View className={`max-w-[70%] ${isMe ? 'mr-3' : 'ml-3'}`}>
      {!isMe && <Text className="mb-1 text-sm text-gray-600">{name}</Text>}
      <View
        className={`rounded-2xl p-3 ${
          isMe ? 'bg-blue-500' : 'bg-white dark:bg-gray-800'
        }`}>
        <Text className={`text-sm ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {message}
        </Text>
      </View>
      <Text className={`mt-1 text-xs text-gray-500 ${isMe ? 'text-right' : ''}`}>{time}</Text>
    </View>
  </View>
);

export default function HaveIndex() {
  const [activeTab, setActiveTab] = useState('聊天广场');

  return (
    <View className="flex-1 bg-white px-4  dark:bg-gray-900">
      {/* 搜索栏 */}
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-white px-4 py-2 dark:bg-gray-800">
          <TextInput
            className="ml-2 flex-1 text-gray-900 dark:text-white"
            placeholder="搜索用户，对话或群聊"
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* 快捷操作图标 */}
      <View className="mb-6 flex-row justify-around px-4">
        <View className="items-center">
          <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="person-add-outline" size={24} color="#4F46E5" />
          </View>
          <Text className="text-xs text-gray-600">添加好友</Text>
        </View>
        <View className="items-center">
          <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Ionicons name="people-outline" size={24} color="#059669" />
          </View>
          <Text className="text-xs text-gray-600">发起群聊</Text>
        </View>
        <View className="items-center">
          <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Ionicons name="videocam-outline" size={24} color="#EA580C" />
          </View>
          <Text className="text-xs text-gray-600">视频会议</Text>
        </View>
      </View>

      {/* Tab切换 */}
      <View className="mb-4 flex-row  justify-center px-4">
        <Pressable
          onPress={() => setActiveTab('聊天广场')}
          className={`mr-8 pb-2 ${activeTab === '聊天广场' ? 'border-b-2 border-blue-500' : ''}`}>
          <Text
            className={activeTab === '聊天广场' ? 'font-semibold text-blue-500' : 'text-gray-600'}>
            聊天广场
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('寻找导师')}
          className={`pb-2 ${activeTab === '寻找导师' ? 'border-b-2 border-blue-500' : ''}`}>
          <Text
            className={activeTab === '寻找导师' ? 'font-semibold text-blue-500' : 'text-gray-600'}>
            寻找导师
          </Text>
        </Pressable>
      </View>

      {activeTab === '聊天广场' ? (
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1"
          keyboardVerticalOffset={90}>
          <View className="flex-1 rounded-[12px] bg-gray-100">
            <Text className='py-4 text-gray-400 text-center'>欢迎来到聊天广场，请文明发言</Text>
            <ScrollView className="flex-1 px-4">
              <Message
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                name="Petter"
                message="大家好，有人想加入这个项目的讨论吗？"
                time="10:30"
              />
              <Message
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty"
                name="Kitty"
                message="我上周参加了一个很有意思的活动，想分享给大家！"
                time="10:32"
              />
              <Message
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea"
                name="Rhea"
                message="我上周参加了，李导师讲得很好用，强烈推荐！"
                time="10:32"
                isMe={true}
              />
            </ScrollView>
            <View className="bg-white dark:bg-gray-800 p-4">
              <View className="flex-row items-center rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2">
                <TextInput
                  className="flex-1 text-gray-900 dark:text-white"
                  placeholder="请输入消息..."
                  placeholderTextColor="#666"
                />
                <Pressable className="ml-2">
                  <Ionicons name="send" size={24} color="#4F46E5" />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView className="px-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">全部导师</Text>
            <Ionicons name="chevron-down-outline" size={20} color="#666" />
          </View>
          <View className="mb-3 rounded-xl bg-white p-4 dark:bg-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty' }}
                  className="h-12 w-12 rounded-full"
                />
                <View className="ml-3">
                  <View className="flex-row items-center">
                    <Text className="mr-2 text-base font-semibold text-gray-900 dark:text-white">
                      张导师
                    </Text>
                    <Text className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-500">
                      资深导师
                    </Text>
                  </View>
                  <Text className="mt-1 text-sm text-gray-500">支持领域：成功学、团队管理</Text>
                </View>
              </View>
              <Pressable className="rounded-full bg-blue-500 px-4 py-1">
                <Text className="text-white">咨询</Text>
              </Pressable>
            </View>
            <View className="mt-2 flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={16} color="#facc15" />
              ))}
              <Text className="ml-1 text-sm text-gray-500">4.9</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
