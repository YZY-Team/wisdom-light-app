import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

cssInterop(LinearGradient, { className: 'style' });

export default function Achievements() {
  return (
    <View className="flex-1  px-4 pt-4">
      {/* 总数据 */}
      <View className="mb-4">
        <Text className="mb-2 text-base font-[800] ">总数据</Text>
        <View className="flex-row flex-wrap justify-between">
          {[
            { value: '89', label: '完成宣告' },
            { value: '12', label: '课程学习' },
            { value: '8', label: '成就解锁' },
            {
              value: '80%',
              label: '目标达成率',
              showProgress: true,
              progress: 80,
            },
          ].map((item, index) => (
            <View
              key={item.label}
              style={{
                // boxShadow: '0px 4px 4px 0px rgba(20, 131, 253, 0.10)',
                elevation: 2,
                zIndex: 1,
              }}
              className={`${
                index < 2 ? 'mb-4' : ''
              } flex h-24 w-[48%] items-center justify-center rounded-xl bg-white`}>
              <View className=" flex h-[80%] w-full items-center justify-center   ">
                <Text
                  className="text-center text-[#1483FD]"
                  style={{
                    fontFamily: 'Roboto',
                    fontSize: 24,
                    fontWeight: '700',
                    lineHeight: 28,
                  }}>
                  {item.value}
                </Text>
                <Text className=" text-center text-sm text-gray-400">{item.label}</Text>
              </View>
              {item.showProgress && (
                <View className="h-[5px] w-full px-4 ">
                  <View className="overflow-hidden rounded-full bg-gray-100">
                    <View
                      className="h-full rounded-full bg-[#FF9F21]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 成就书列表 */}
      <View>
        <View className="mb-4 flex flex-row items-center    justify-between">
          <Text className=" flex items-center justify-center text-base  font-[800] ">成就书</Text>
          <Pressable>
            <Text className="text-sm   font-[800] text-[#1483FD] underline">简介</Text>
          </Pressable>
        </View>
        <View className="flex flex-col gap-2 ">
          {[
            {
              icon: 'person',
              color: '#FFB74D',
              title: '个人资料',
              status: '已完成',
              date: '2023/4/15',
            },
            {
              icon: 'star',
              color: '#4CAF50',
              title: '我的约誓',
              status: '已完成',
              date: '2023/4/15',
            },
            {
              icon: 'book',
              color: '#2196F3',
              title: '我的承诺',
              status: '完成进行课程学习',
              date: '2023/4/15',
            },
            {
              icon: 'rocket',
              color: '#F44336',
              title: '创造成果',
              status: '完成进行课程学习',
              date: '2023/4/15',
            },
          ].map((item) => (
            <Pressable
              key={item.title}
              className="h-[90px] flex-row gap-4  items-center rounded-xl bg-white p-4">
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.color}20` }}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View className="ml-3 flex flex-1 flex-col gap-1">
                <Text className="text-base font-medium">{item.title}</Text>
                <Text className=" text-sm text-gray-400">{item.status}</Text>
                <Text className="text-xs text-gray-300">创建于 {item.date}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
