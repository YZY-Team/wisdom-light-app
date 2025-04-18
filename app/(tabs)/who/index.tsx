import { Href, Link, useFocusEffect } from 'expo-router';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { userApi } from '~/api/who/user';
import { useUserStore } from '~/store/userStore';
import { useState } from 'react';
import { Modal, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fileApi } from '~/api/who/file';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type MenuItemProps = {
  icon: string;
  title: string;
  href: Href;
  color?: string;
};

const MenuItem = ({ icon, title, href }: MenuItemProps) => (
  <Link href={href} asChild>
    <Pressable className="flex-row items-center px-4 py-4">
      <Image source={icon} className="h-5 w-5" contentFit="contain" />
      <Text className="ml-4 flex-1 text-[#333]">{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
    </Pressable>
  </Link>
);

export default function WhoIndex() {
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const userInfo = useUserStore((state) => state.userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState<'nickname' | 'username' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    userApi.me().then((res) => {
      if (res.code === 200 && res.data) {
        console.log('用户信息', res.data);
        setUserInfo(res.data);
      }
    });
  }, []);

  const handleEdit = (type: 'nickname' | 'username') => {
    setEditType(type);
    setEditValue(type === 'nickname' ? userInfo?.nickname || '' : userInfo?.username || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!editType || !editValue.trim()) return;

      const res = await userApi.updateProfile({
        [editType]: editValue.trim(),
      });

      if (res.code === 200 && res.data) {
        const newUserInfo = {
          ...userInfo,
          [editType]: editValue.trim(),
        };
        // @ts-expect-error
        setUserInfo(newUserInfo);
        setIsEditing(false);
        console.log('更新成功:', res.data);
      }
    } catch (error) {
      console.log('更新失败:', error);
    }
  };

  // 处理头像选择和上传
  const handleAvatarPress = async () => {
    try {
      // 请求权限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('需要访问相册权限才能选择图片');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const uri = result.assets[0].uri;
          const filename = uri.split('/').pop() || 'image.jpg';

          const formData = new FormData();
          formData.append('file', {
            uri,
            name: filename,
            type: 'image/jpeg',
          } as any);
          formData.append('source', 'IMAGE_URL');
          const randomId = Date.now().toString();
          formData.append('relatedId', randomId);
          formData.append('bucketName', 'image');

          // 直接使用 fetch
          const response = await fetch('http://192.168.1.158:8080/api/system/file/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          });

          const uploadRes = await response.json();
          console.log('上传结果:', uploadRes);

          if (uploadRes.code === 200 && uploadRes.data) {
            // 更新用户信息
            const updateRes = await userApi.updateProfile({
              avatarUrl: uploadRes.data.url,
            });

            if (updateRes.code === 200) {
              const newUserInfo = {
                ...userInfo,
                avatarUrl: uploadRes.data.url,
              };
              // @ts-expect-error
              setUserInfo(newUserInfo);
            }
          }
        } catch (error) {
          console.log('上传失败:', error);
          alert('上传失败，请重试');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.log('选择图片失败:', error);
      alert('选择图片失败，请重试');
    }
  };

  // 添加退出登录处理函数
  const handleLogout = async () => {
    try {
      
      await AsyncStorage.removeItem('token');
      // 清除用户信息
      setUserInfo(null);
      // 跳转到登录页
      router.replace('(auth)/login');
    } catch (error) {
      console.log('退出登录失败:', error);
      alert('退出登录失败，请重试');
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#E7F2FF', '#FFF']}
        className="absolute w-full"
        style={{
          top: '22%',
          height: '78%',
        }}
      />
      <Image
        source={require('~/assets/images/who/bg.png')}
        className="absolute h-[22%] w-full"
        contentFit="cover"
      />
      <ScrollView className="flex-1">
        {/* 个人信息卡片 */}
        <View className="items-center pt-20">
          <Pressable
            onPress={handleAvatarPress}
            className="mb-3 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white">
            {userInfo?.avatarUrl ? (
              <Image
                source={{ uri: userInfo.avatarUrl }}
                className="h-24 w-24"
                contentFit="cover"
              />
            ) : (
              <>
                <Ionicons name="camera" size={24} color="#1483FD" />
                {uploading && (
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </>
            )}
          </Pressable>
          <View className="items-center">
            <Pressable onPress={() => handleEdit('nickname')} className="flex-row items-center">
              <Text className="text-xl font-medium text-black">
                {userInfo?.nickname || '设置昵称'}
              </Text>
              <Ionicons name="create-outline" size={20} color="#1483FD" className="ml-1" />
            </Pressable>
            <Pressable
              onPress={() => handleEdit('username')}
              className="mt-1 flex-row items-center">
              <Text className="text-sm text-black">ID: {userInfo?.username || '设置ID'}</Text>
              <Ionicons name="create-outline" size={16} color="#1483FD" className="ml-1" />
            </Pressable>
          </View>
        </View>

        {/* 功能菜单 */}
        <View
          style={{
            boxShadow: '0px 4px 30px 0px rgba(20, 131, 253, 0.25)',
          }}
          className="mx-4 mt-8 overflow-hidden rounded-xl bg-white">
          <MenuItem
            icon={require('~/assets/images/who/settings.png')}
            title="通用设置"
            href="/who/general"
          />
          <MenuItem
            icon={require('~/assets/images/who/customer-service.png')}
            title="人工客服"
            href="/who/support"
          />
          <MenuItem
            icon={require('~/assets/images/who/vip.png')}
            title="会员充值"
            href="/who/membership"
          />
          <MenuItem
            icon={require('~/assets/images/who/join.png')}
            title="申请入驻"
            href="/who/become-mentor"
          />
        </View>

        {/* 版本信息 */}
        <Text className="mb-4 mt-[120px]  text-center text-xs text-[#999]">
          Wisdom Light v1.0.0
        </Text>
        <Pressable onPress={handleLogout} className="bg justify-center flex-row items-center px-4 py-4">
          <Text className="ml-4 flex-1 text-[#FF4D4F]">退出登录</Text>
        </Pressable>
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}>
        <Pressable
          className="flex-1 justify-center bg-black/50 px-4"
          onPress={() => setIsEditing(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-2 text-base text-gray-600">
                {editType === 'nickname' ? '编辑昵称' : '编辑用户名'}
              </Text>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                className="rounded-lg border border-gray-200 p-3"
                placeholder={editType === 'nickname' ? '请输入昵称' : '请输入用户名'}
                maxLength={20}
                autoFocus
              />
              <View className="mt-4 flex-row justify-end space-x-2">
                <Pressable
                  onPress={() => setIsEditing(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2">
                  <Text>取消</Text>
                </Pressable>
                <Pressable onPress={handleSave} className="rounded-lg bg-blue-500 px-4 py-2">
                  <Text className="text-white">保存</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <View className="h-[1px] bg-gray-100" />
    </View>
  );
}
