import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { friendApi } from '~/api/have/friend';
import { FindFriend, Friend, FriendRequest } from '~/types/have/friendType';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { memo } from 'react';
import { useUserStore } from '~/store/userStore';

export default function AddFriend() {
  const insets = useSafeAreaInsets();
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const searchText=useRef('');
  const [searchResults, setSearchResults] = useState<FindFriend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userInfo=useUserStore((state)=>state.userInfo);
  // 获取待处理的好友请求
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await friendApi.getPendingRequests();
        console.log("response",response);
        setPendingRequests(response.data);
      } catch (error) {
        console.log('获取待处理好友请求失败:', error);
      }
    };
    fetchPendingRequests();
  }, []);

  // 处理添加好友
  const handleAddFriend = async (receiverId: string) => {
    try {
      await friendApi.sendRequest({
        senderId: userInfo!.globalUserId, // 这里应该是当前用户的ID
        receiverId,
        requestMessage: '请求添加好友',
      });
      alert('好友请求已发送');
    } catch (error) {
      console.log('发送好友请求失败:', error);
      alert('发送好友请求失败');
    }
  };

  // 处理同意好友请求
  const handleAcceptRequest = async (requestId: string) => {
    console.log("requestId",requestId);
    try {
      await friendApi.acceptRequest({requestId,nickname:"不知道"});
      setPendingRequests((prev) => prev.filter((req) => req.requestId !== requestId));
      alert('已同意好友请求');
    } catch (error) {
      console.log('同意好友请求失败:', error);
      alert('同意好友请求失败');
    }
  };

  // 删除 debouncedSearch 和 handleTextChange

  // 处理搜索提交
  const handleSubmitSearch = async () => {
    if (!searchText.current.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await friendApi.findFriends(searchText.current.trim());
      if (res.code === 200) {
        // 如果返回的是单个对象，将其转换为数组
        const results = Array.isArray(res.data) ? res.data : [res.data];
        // @ts-expect-error
        setSearchResults(results.filter(Boolean) || []);
      }
    } catch (error) {
      console.log('搜索好友失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除这些不需要的函数：
  // - searchFriends
  // - debouncedSearch
  // - handleTextChange
  const handSearch=(text:string)=>{
    console.log("text",text);
    searchText.current=text;
  }

  interface SearchViewProps {
      searchText: React.MutableRefObject<string>;
      handleSubmitSearch: () => Promise<void>;
      isLoading: boolean;
      setIsSearching: (value: boolean) => void;
      setSearchResults: React.Dispatch<React.SetStateAction<FindFriend[]>>;
    }
  
    const SearchView = memo(({ 
      searchText, 
      handleSubmitSearch, 
      isLoading, 
      setIsSearching, 
      setSearchResults 
    }: SearchViewProps) => (
    <>
      <View className="flex-row items-center px-4 py-4">
        <View className="flex-1 flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
          <TextInput
            className="ml-2 h-[30px] flex-1 text-black/40"
            placeholder="输入用户名搜索"
            placeholderTextColor="#666"
            // value={searchText}
            onChangeText={handSearch}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            blurOnSubmit={false}  // 添加此属性
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" />
          )}
        </View>
        <Pressable
          className="ml-2"
          onPress={() => {
            setIsSearching(false);
            searchText.current='';
            setSearchResults([]);
          }}>
          <Text className="text-base text-[#1687fd]">取消</Text>
        </Pressable>
      </View>

      {/* 搜索结果 */}
      <ScrollView className="flex-1 px-4">
        {searchResults.map((user) => (
          <View
            key={user.globalUserId}
            className="mb-2 flex-row items-center justify-between rounded-[12px] bg-[#1483FD0D] px-2 py-2">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri:
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.globalUserId}`,
                }}
                className="h-12 w-12 rounded-full"
                contentFit="cover"
              />
              <View className="ml-3">
                <Text className="text-base font-medium">{user.nickname}</Text>
                <Text className="text-sm text-gray-500">ID: {user.globalUserId}</Text>
              </View>
            </View>
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-[70px] rounded-[6px]"
              style={{
                boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
              }}>
              <Pressable
                className="h-[30px] items-center justify-center"
                onPress={() => handleAddFriend(user.globalUserId)}>
                <Text className="text-center text-[16px] font-semibold text-white">添加</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ))}
        {searchText && !isLoading && searchResults.length === 0 && (
          <Text className="mt-4 text-center text-gray-500">未找到相关用户</Text>
        )}
      </ScrollView>
    </>
  ));

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

      {isSearching ? (
        <SearchView 
          searchText={searchText}
          handleSubmitSearch={handleSubmitSearch}
          isLoading={isLoading}
          setIsSearching={setIsSearching}
          setSearchResults={setSearchResults}
        />
      ) : (
        <>
          <Pressable className="mx-4 mb-2 mt-4" onPress={() => setIsSearching(true)}>
            <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
              <Text className="ml-2 h-[30px] flex-1 leading-[30px] text-black/40">
                输入番号+姓名
              </Text>
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
                  source={{
                    uri:
                      request.senderAvatar ||
                      'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
                  }}
                  className="h-12 w-12 rounded-full"
                  contentFit="cover"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium">{request.senderName}</Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    
                    {request.requestMessage || '请求添加好友'}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-400">
                    {new Date(request.createTime).toLocaleDateString()}
                  </Text>
                </View>
                <LinearGradient
                  colors={['#20B4F3', '#5762FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-[70px] rounded-[6px]"
                  style={{
                    boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                  }}>
                  <Pressable
                    className="h-[30px] items-center justify-center"
                    onPress={() => handleAcceptRequest(request.requestId)}>
                    <Text className="text-center text-[16px] font-semibold text-white">同意</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
