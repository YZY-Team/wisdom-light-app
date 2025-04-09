import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { friendApi } from '~/api/have/friend';
import { FriendRequest } from '~/types/have/friendType';

export default function AddFriend() {
  const insets = useSafeAreaInsets();
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchText, setSearchText] = useState('');

  // 获取待处理的好友请求
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await friendApi.getPendingRequests();
        setPendingRequests(response.data);
      } catch (error) {
        console.error('获取待处理好友请求失败:', error);
      }
    };
    fetchPendingRequests();
  }, []);

  // 处理添加好友
  const handleAddFriend = async (receiverId: number) => {
    try {
      await friendApi.sendRequest({
        senderId: 1909907988085252097, // 这里应该是当前用户的ID
        receiverId,
        requestMessage: '请求添加好友'
      });
      alert('好友请求已发送');
    } catch (error) {
      console.error('发送好友请求失败:', error);
      alert('发送好友请求失败');
    }
  };

  // 处理同意好友请求
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendApi.acceptRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.requestId !== requestId));
      alert('已同意好友请求');
    } catch (error) {
      console.error('同意好友请求失败:', error);
      alert('同意好友请求失败');
    }
  };

  const SearchView = () => (
    <>
      <View className="flex-row items-center px-4 py-4">
        <View className="flex-1 flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
          <TextInput
            className="ml-2 h-[30px] flex-1 text-black/40"
            placeholder="输入番号+姓名"
            placeholderTextColor="#666"
            autoFocus
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
        <Pressable className="ml-2" onPress={() => setIsSearching(false)}>
          <Text className="text-base text-[#1687fd]">取消</Text>
        </Pressable>
      </View>

      {/* 搜索结果 */}
      <View className="px-4 py-2">
        <View className="flex-row items-center justify-between rounded-[12px] bg-[#1483FD0D] px-2 py-2">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1212Peter' }}
              className="h-12 w-12 rounded-full"
              contentFit="cover"
            />
            <Text className="ml-3 text-base">模拟账号:1909855525598679042</Text>
          </View>
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-[70px] rounded-[6px]"
            style={{
              boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
            }}
          >
            <Pressable 
              className="h-[30px] items-center justify-center"
              onPress={() => handleAddFriend(1909855525598679042)}
            >
              <Text className="text-center text-[16px] font-semibold text-white">添加</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </>
  );

  const FriendRequestsView = () => (
    <>
      {/* 搜索入口 */}
      <Pressable className="mx-4 mb-2 mt-4" onPress={() => setIsSearching(true)}>
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
          <Text className="ml-2 h-[30px] flex-1 leading-[30px] text-black/40">输入番号+姓名</Text>
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </Pressable>

      {/* 好友申请列表 */}
      <ScrollView className="flex-1">
        {pendingRequests.map((request) => (
          <View
            key={request.requestId}
            className="flex-row items-center border-b border-gray-100 px-6 py-3">
            <Image
              source={{ uri: request.senderAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' }}
              className="h-12 w-12 rounded-full"
              contentFit="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium">{request.senderName}</Text>
              <Text className="mt-1 text-sm text-gray-500">{request.requestMessage || '请求添加好友'}</Text>
              <Text className="mt-1 text-xs text-gray-400">{new Date(request.createTime).toLocaleDateString()}</Text>
            </View>
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-[70px] rounded-[6px]"
              style={{
                boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
              }}
            >
              <Pressable 
                className="h-[30px] items-center justify-center"
                onPress={() => handleAcceptRequest(request.requestId)}
              >
                <Text className="text-center text-[16px] font-semibold text-white">同意</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View className="flex-1 bg-white">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => (isSearching ? setIsSearching(false) : router.back())}
          className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold">
          {isSearching ? '添加好友' : '新的朋友'}
        </Text>
      </View>

      {isSearching ? <SearchView /> : <FriendRequestsView />}
    </View>
  );
}
