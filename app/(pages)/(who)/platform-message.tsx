import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface MessageItem {
  id: string;
  title: string;
  time: string;
}

export default function PlatformMessage() {
  const router = useRouter();
  
  const messages: MessageItem[] = [
    {
      id: "1",
      title: "【限时优惠】《XX课程》今日上线！名师亲授 | 实战案例 | 1v1答疑",
      time: "5分钟前"
    },
    {
      id: "2",
      title: "名师亲授 | 实战案例 | 1v1答疑",
      time: "18：30"
    },
    {
      id: "3",
      title: "亲爱的学员，《XX课程》明天20:00正式开课...",
      time: "4月18号"
    }
  ];

  const renderItem = ({ item }: { item: MessageItem }) => (
    <TouchableOpacity className="px-4 py-3 bg-white rounded-lg mb-3">
      <Text className="text-[14px] text-black mb-1">{item.title}</Text>
      <Text className="text-[10px] text-right text-black/40">{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#F5F8FC]">
      {/* 顶部导航栏 */}
      <View className="px-4 py-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px]">平台消息</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* 消息列表 */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
      />
    </View>
  );
}