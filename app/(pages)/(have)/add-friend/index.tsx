import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { FindFriend } from '~/types/have/friendType';
import { memo } from 'react';
import { useUserStore } from '~/store/userStore';
import {
  usePendingRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useFindFriends,
} from '~/queries/friend';

export default function AddFriend() {
  const insets = useSafeAreaInsets();
  const [isSearching, setIsSearching] = useState(false);
  const searchText = useRef('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const userInfo = useUserStore((state) => state.userInfo);

  // 使用React Query获取待处理的好友请求
  const { pendingRequests, isLoading: isLoadingRequests } = usePendingRequests();

  // 使用React Query发送好友请求
  const { mutate: sendFriendRequest, isPending: isSendingRequest } = useSendFriendRequest();

  // 使用React Query接受好友请求
  const { mutate: acceptFriendRequest, isPending: isAcceptingRequest } = useAcceptFriendRequest();

  // 使用React Query搜索好友
  const {
    searchResults,
    isLoading: isSearchingFriends,
    refetch: refetchSearch,
  } = useFindFriends(currentSearchTerm);

  // 处理添加好友
  const handleAddFriend = async (receiverId: string) => {
    if (!userInfo?.globalUserId) {
      alert('用户未登录');
      return;
    }

    sendFriendRequest(
      {
        senderId: userInfo.globalUserId,
        receiverId,
        requestMessage: '请求添加好友',
      },
      {
        onSuccess: () => {
          alert('好友请求已发送');
        },
        onError: (error) => {
          console.log('发送好友请求失败:', error);
          alert('发送好友请求失败');
        },
      }
    );
  };

  // 处理同意好友请求
  const handleAcceptRequest = async (requestId: string) => {
    acceptFriendRequest(
      {
        requestId,
        nickname: '不知道',
      },
      {
        onSuccess: () => {
          alert('已同意好友请求');
        },
        onError: (error) => {
          console.log('同意好友请求失败:', error);
          alert('同意好友请求失败');
        },
      }
    );
  };

  // 处理搜索提交
  const handleSubmitSearch = async () => {
    if (!searchText.current.trim()) {
      setCurrentSearchTerm('');
      return;
    }
    setCurrentSearchTerm(searchText.current.trim());
  };

  const handSearch = (text: string) => {
    searchText.current = text;
  };

  interface SearchViewProps {
    searchText: React.MutableRefObject<string>;
    handleSubmitSearch: () => Promise<void>;
    isLoading: boolean;
    setIsSearching: (value: boolean) => void;
    searchResults: FindFriend[];
  }

  const SearchView = memo(
    ({
      searchText,
      handleSubmitSearch,
      isLoading,
      setIsSearching,
      searchResults,
    }: SearchViewProps) => (
      <>
        <View className="flex-row items-center px-4 py-4">
          <View className="flex-1 flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
            <TextInput
              className="ml-2 h-[30px] flex-1  py-0 "
              placeholder="输入用户名搜索"
              placeholderTextColor="#666"
              onChangeText={handSearch}
              onSubmitEditing={handleSubmitSearch}
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Pressable onPress={handleSubmitSearch}>
                <Ionicons name="search-outline" size={20} color="#666" />
              </Pressable>
            )}
          </View>
          <Pressable
            className="ml-2"
            onPress={() => {
              setIsSearching(false);
              searchText.current = '';
              setCurrentSearchTerm('');
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
          {currentSearchTerm && !isLoading && searchResults.length === 0 && (
            <Text className="mt-4 text-center text-gray-500">未找到相关用户</Text>
          )}
        </ScrollView>
      </>
    )
  );

  return (
    <View className="flex-1 bg-white">
      {/* 头部 */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => {
            console.log('back');
            router.back();
          }}
          className="absolute left-2 z-10 h-10 w-10 items-center justify-center rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
          })}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold">
          {isSearching ? '添加好友' : '新的朋友'}
        </Text>
      </View>

      {isSearching ? (
        <SearchView
          searchText={searchText}
          handleSubmitSearch={handleSubmitSearch}
          isLoading={isSearchingFriends}
          setIsSearching={setIsSearching}
          searchResults={searchResults}
        />
      ) : (
        <>
          <Pressable className="mx-4 mb-2 mt-4" onPress={() => setIsSearching(true)}>
            <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 py-2">
              <Text
                className="ml-2 h-[30px] flex-1 leading-[30px] "
                numberOfLines={1}
                ellipsizeMode="tail">
                输入番号+姓名
              </Text>
              <Ionicons name="search-outline" size={20} color="#666" />
            </View>
          </Pressable>

          {/* 好友申请列表 */}
          <ScrollView className="flex-1">
            {isLoadingRequests ? (
              <View className="items-center justify-center p-4">
                <ActivityIndicator size="large" color="#1687fd" />
              </View>
            ) : pendingRequests.length === 0 ? (
              <Text className="mt-4 text-center text-gray-500">暂无好友请求</Text>
            ) : (
              pendingRequests.map((request) => (
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
                      onPress={() => handleAcceptRequest(request.requestId)}
                      disabled={isAcceptingRequest}>
                      <Text className="text-center text-[16px] font-semibold text-white">同意</Text>
                    </Pressable>
                  </LinearGradient>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
