import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MessageProps = {
  content: string;
  time: string;
  user: {
    name: string;
    avatar: string;
  };
  isSelf?: boolean;
};

const Message = ({ content, time, user, isSelf }: MessageProps) => (
  <View className={`mb-4 flex-row ${isSelf ? 'flex-row-reverse' : ''}`}>
    <Image
      source={{ uri: user.avatar }}
      className="h-10 w-10 rounded-full"
      contentFit="cover"
    />
    <View className={`${isSelf ? 'mr-3 items-end' : 'ml-3'}`}>
      {!isSelf && <Text className="mb-1 text-sm text-gray-600">{user.name}</Text>}
      <View
        className={`max-w-[70%] rounded-2xl p-3 ${
          isSelf ? 'bg-blue-500' : 'bg-white'
        }`}>
        <Text className={isSelf ? 'text-white' : 'text-gray-800'}>{content}</Text>
      </View>
      <Text className="mt-1 text-xs text-gray-400">{time}</Text>
    </View>
  </View>
);

export default function ChatSquare() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-[#1483fd]/10">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium">聊天广场</Text>
      </View>

      {/* 消息区域 */}
      <View className="flex-1">
        <Text className=" px-4 py-2 text-center text-[#757575] text-sm ">
          欢迎来到聊天广场，请文明发言！
        </Text>
        <ScrollView className="flex-1 p-4">
          <Message
            content='大家好，有人近期知道"日新设定发布会"的详细信息？'
            time="10:20"
            user={{
              name: 'Peter',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter',
            }}
          />
          <Message
            content="我上周参加了，学习积分讲得很实用，强烈推荐！"
            time="10:22"
            user={{
              name: 'Kitty',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
            }}
          />
          <Message
            content="我也觉得很不错，特别是关于个人成长部分的内容"
            time="10:23"
            user={{
              name: 'Rhea',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
            }}
            isSelf={true}
          />
          <Message
            content="下次什么时候还有类似的活动？"
            time="10:25"
            user={{
              name: 'Tom',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
            }}
          />
          <Message
            content="据说下个月中旬会有一场，主题是'智慧之光修行体系'"
            time="10:26"
            user={{
              name: 'Sarah',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            }}
          />
          <Message
            content="太好了，我一定要参加！"
            time="10:27"
            user={{
              name: 'Rhea',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhea',
            }}
            isSelf={true}
          />
        </ScrollView>
      </View>

      {/* 底部输入框 */}
      <View style={{
         paddingBottom: insets.bottom + 20 || 20,
      }} className="p-4">
        <View className="flex-row items-center" >
          <View style={{
          boxShadow:"0px 4px 4px 0px rgba(82, 100, 255, 0.10)"
        }} className="flex-1 flex-row items-center bg-gray-100 rounded-[12px] px-6 py-3">
            <TextInput
              className="flex-1"
              placeholder="请输入消息..."
              placeholderTextColor="#999"
            />
            <Pressable>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1483FD]">
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}