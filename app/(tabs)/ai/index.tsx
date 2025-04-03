import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const Message = ({ isAI, content, time }: { isAI: boolean; content: string; time: string }) => (
  <View className={`flex-row ${isAI ? '' : 'flex-row-reverse'} mb-4`}>
    {isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant' }}
        className="h-10 w-10 rounded-full bg-blue-100"
      />
    )}
    <View
      className={`mx-3 max-w-[70%] ${isAI ? 'bg-white' : 'bg-blue-500'} rounded-2xl p-4 shadow-sm`}>
      <Text className={`text-base ${isAI ? 'text-gray-800' : 'text-white'}`}>{content}</Text>
    </View>
    {!isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }}
        className="h-10 w-10 rounded-full bg-gray-100"
      />
    )}
  </View>
);

export default function AiIndex() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* 顶部标题栏 */}
      <View className="flex-row items-center justify-between bg-blue-500 px-4 py-3">
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          <Text className="ml-2 text-xl font-semibold text-white">AI助手</Text>
        </View>
        <Pressable className="flex-row items-center rounded-full bg-blue-400 px-3 py-1">
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text className="ml-1 text-sm text-white">生成报告</Text>
        </Pressable>
      </View>

      {/* 聊天消息列表 */}
      <ScrollView className="flex-1 px-4 py-4">
        <Message
          isAI={true}
          content="你好！我是Wisdom Light的AI助手。今天我能为你提供什么帮助？"
          time="14:00"
        />
        <Message
          isAI={false}
          content="我想了解如何更好地管理我的时间"
          time="14:01"
        />
        <Message
          isAI={true}
          content="时间管理是提高效率的关键。我推荐你可以尝试以下方法：\n1. 番茄钟工作法：25分钟专注工作，然后休息5分钟\n2. 建立每日优先清单，先完成最要紧且紧急的任务\n3. 减少干扰源，如手机通知等\n4. 定期回顾和调整你的时间分配方式\n\n此外，我有到我们平台有一门高效时间管理的课程，由主导师授课，评分很高，你可能会感兴趣。"
          time="14:02"
        />
      </ScrollView>

      {/* 底部输入框 */}
      <View className="border-t border-gray-200 bg-white p-4">
        <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2">
          <TextInput
            className="flex-1"
            placeholder="请输入问题..."
            placeholderTextColor="#666"
          />
          <Pressable className="ml-2">
            <Ionicons name="send" size={24} color="#3b82f6" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}