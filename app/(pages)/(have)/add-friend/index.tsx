import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useRef, useState } from 'react';
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
  const {
    pendingRequests,
    isLoading: isLoadingRequests,
    refetch: refetchPendingRequests,
  } = usePendingRequests();

  useFocusEffect(
    useCallback(() => {
      refetchPendingRequests();
    }, [])
  );

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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [selectedAcceptRequestId, setSelectedAcceptRequestId] = useState<string | null>(null);
  const [acceptRemarkText, setAcceptRemarkText] = useState('');

  // 处理添加好友
  const handleAddFriend = (receiverId: string) => {
    setSelectedReceiverId(receiverId);
    setRemarkText('');
    setModalVisible(true);
  };

  // 处理同意好友请求
  const handleAcceptRequest = (requestId: string) => {
    setSelectedAcceptRequestId(requestId);
    setAcceptRemarkText('');
    setAcceptModalVisible(true);
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

  const confirmAddFriend = () => {
    if (!userInfo?.globalUserId) {
      alert('用户未登录');
      setModalVisible(false);
      return;
    }
    if (!selectedReceiverId) return;
    sendFriendRequest(
      {
        senderId: userInfo.globalUserId,
        receiverId: selectedReceiverId,
        requestMessage: remarkText.trim() || '请求添加好友',
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          alert('好友请求已发送');
        },
        onError: (error) => {
          console.log('发送好友请求失败:', error);
          alert('发送好友请求失败');
        },
      }
    );
  };

  const confirmAcceptRequest = () => {
    if (!selectedAcceptRequestId) return;
    acceptFriendRequest(
      {
        requestId: selectedAcceptRequestId,
        nickname: acceptRemarkText.trim() || '朋友',
      },
      {
        onSuccess: () => {
          setAcceptModalVisible(false);
          alert('已同意好友请求');
        },
        onError: (error) => {
          console.log('同意好友请求失败:', error);
          alert('同意好友请求失败');
        },
      }
    );
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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-11/12 rounded-lg bg-white p-4">
            <Text className="mb-2 text-lg font-semibold">添加好友备注</Text>
            <TextInput
              className="mb-4 rounded border border-gray-300 px-2 py-1"
              placeholder="请输入备注"
              value={remarkText}
              onChangeText={setRemarkText}
            />
            <View className="flex-row justify-end">
              <Pressable onPress={() => setModalVisible(false)} className="px-4 py-2">
                <Text className="text-base text-gray-500">取消</Text>
              </Pressable>
              <Pressable onPress={confirmAddFriend} className="px-4 py-2">
                <Text className="text-base text-[#1687fd]">确定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={acceptModalVisible} transparent animationType="slide">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-11/12 rounded-lg bg-white p-4">
            <Text className="mb-2 text-lg font-semibold">备注好友</Text>
            <TextInput
              className="mb-4 rounded border border-gray-300 px-2 py-1"
              placeholder="请输入备注"
              value={acceptRemarkText}
              onChangeText={setAcceptRemarkText}
            />
            <View className="flex-row justify-end">
              <Pressable onPress={() => setAcceptModalVisible(false)} className="px-4 py-2">
                <Text className="text-base text-gray-500">取消</Text>
              </Pressable>
              <Pressable onPress={confirmAcceptRequest} className="px-4 py-2">
                <Text className="text-base text-[#1687fd]">确定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
