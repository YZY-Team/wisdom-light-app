import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { friendApi } from '~/api/have/friend';
import { tutorApi } from '~/api/who/tutor';
import { Friend } from '~/types/have/friendType';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ visible, onClose, onSuccess }: AddStudentModalProps) {
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 搜索好友
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await friendApi.findFriends(searchText);
      console.log("response",response);
      setSearchResults(response.data || {});
      if (!response.data) {
        setError('未找到相关好友');
      }
    } catch (err) {
      setError('搜索失败，请稍后再试');
      console.error('搜索好友失败:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 添加学员
  const handleAddStudent = async (studentId: string) => {
    setIsAdding(true);
    setError(null);
    
    try {
      const response = await tutorApi.addTutorStudent(studentId);
      console.log("response",response);
      if(response.code === 200){
        onSuccess();
        onClose();
      }else{
        setError('添加学员失败，请稍后再试');
      }
    } catch (err) {
      setError('添加学员失败，请稍后再试');
      console.error('添加学员失败:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // 渲染好友项
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center">
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <Text className="text-gray-500">{item.username?.charAt(0)}</Text>
          )}
        </View>
        <View className="ml-3">
          <Text className="font-medium">{item.username || '未知用户'}</Text>
          {item.nickname && <Text className="text-gray-500 text-sm">{item.nickname}</Text>}
        </View>
      </View>
      <TouchableOpacity
        className="bg-[#1483FD] px-4 py-2 rounded-full"
        onPress={() => handleAddStudent(item.globalUserId)}
        disabled={isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white">添加</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
        <View className="bg-white w-[90%] max-h-[70%] rounded-lg overflow-hidden">
          {/* 模态框标题 */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-medium">添加学员</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#00000080" />
            </TouchableOpacity>
          </View>
          
          {/* 搜索框 */}
          <View className="p-4 flex-row">
            <TextInput
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
              placeholder="请输入好友名称"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              className="bg-[#1483FD] px-4 py-2 rounded-r-lg justify-center"
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white">搜索</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* 错误信息 */}
          {error && (
            <View className="px-4 py-2">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}
          
          {/* 搜索结果 */}
          <FlatList
            data={[searchResults]}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={
              !isSearching && searchText ? (
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-gray-500">未找到相关好友</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
} 