import { Href, Link, useFocusEffect } from 'expo-router';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect } from 'react';
import { userApi } from '~/api/who/user';
import { useUserStore } from '~/store/userStore';
import { useState } from 'react';
import { Modal, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fileApi } from '~/api/who/file';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { cssInterop } from 'nativewind';
import { clearDatabase } from '~/services/database';
import { useDatabase } from '~/contexts/DatabaseContext';
import { dialogApi } from '~/api/have/dialog';
import { NativeWechatConstants, sendAuthRequest, shareText } from 'expo-native-wechat';
import { achievementBookApi } from '~/api/be/achievementBook';
import { useAuthStore } from '~/store/authStore';
import { useActiveAchievementBook } from '~/queries/achievement';
import { useQuery } from '@tanstack/react-query';

const testCreateGroupDialog = ({
  title,
  avatarUrl,
  memberIds,
  description,
}: {
  title: string;
  avatarUrl: string;
  memberIds: string[];
  description: string;
}) => {
  dialogApi.createGroupDialog({
    title,
    avatarUrl,
    memberIds,
    description,
  });
};

cssInterop(Image, { className: 'style' });
type MenuItemProps = {
  icon: string;
  title: string;
  href: Href;
  color?: string;
  width?: number;
};

const MenuItem = ({ icon, title, href, width }: MenuItemProps) => (
  <Link href={href} asChild>
    <Pressable className="flex-row items-center px-4 py-4">
      <Image
        source={icon}
        className={width ? `w-${width} h-${width}` : 'h-5 w-5'}
        contentFit="contain"
      />
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const { initialize, isInitializing } = useDatabase();
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const { data: userinfoQuery, refetch: refetchUserinfo } = useQuery({
    queryKey: ['userinfo'],
    queryFn: () => userApi.me().then((res) => res.data),
  });


  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('token').then((token) => {
        console.log('token', token);
      });
      refetchUserinfo().then((res) => {
        if (res.data) {
          setUserInfo(res.data);
        }
      });
    }, []),
  );

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
      Alert.alert('ID重复,请重新输入');
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
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const uri = result.assets[0].uri;
          const filename = uri.split('/').pop() || 'image.jpg';
          const randomId = Date.now().toString();

          const response = await fileApi.uploadImage({
            file: {
              uri,
              name: filename,
              type: result.assets[0].mimeType,
            },
            relatedId: randomId,
          });

          console.log('上传结果:', response);

          if (response.code === 200 && response.data) {
            // 更新用户信息
            const updateRes = await userApi.updateProfile({
              avatarUrl: response.data.url,
            });

            if (updateRes.code === 200) {
              const newUserInfo = {
                ...userInfo,
                avatarUrl: response.data.url,
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
      setLoggingOut(true);
      await AsyncStorage.removeItem('token');
      // 清除用户信息
      setUserInfo(null);
      // 清除数据库连接
      await clearDatabase();
      // 初始化默认数据库
      await initialize();
      // 跳转到登录页
      setIsLoggedIn(false);
    } catch (error) {
      console.log('退出登录失败:', error);
      alert('退出登录失败，请重试');
    } finally {
      setLoggingOut(false);
    }
  };

  // 处理创建群聊
  const handleCreateGroup = async () => {
    try {
      if (!groupTitle.trim()) {
        alert('请输入群聊名称');
        return;
      }

      const res = await dialogApi.createGroupDialog({
        title: groupTitle.trim(),
        avatarUrl: userInfo?.avatarUrl || '',
        memberIds: [userInfo?.globalUserId || ''],
        description: groupDescription.trim(),
      });

      if (res.code === 200) {
        alert('创建群聊成功');
        setShowCreateGroupModal(false);
        setGroupTitle('');
        setGroupDescription('');
      }
    } catch (error) {
      console.log('创建群聊失败:', error);
      alert('创建群聊失败，请重试');
    }
  };
  const { data: activeAchievementBook, refetch } = useActiveAchievementBook();

  console.log('activeAchievementBook', activeAchievementBook);

  // 处理创建成就书
  const handleCreateAchievementBook = async () => {
    console.log('创建成就书', activeAchievementBook);
    if (activeAchievementBook?.code === 200) {
      alert('您已经创建了成就书');
      return;
    }
    const res = await achievementBookApi.createAchievementBook({
      userId: userInfo?.globalUserId || '',
    });
    if (res.code === 200) {
      alert('创建成就书成功');
      refetch();
    } else {
      alert('创建成就书失败');
    }
    console.log('创建成就书结果:', res);
  };

  const onButtonClicked = async () => {
    shareText({
      text: 'Hello Hector!',
      scene: NativeWechatConstants.WXSceneSession,
    });
    // await verifyWechatCode(code);
  };
  return (
    <View className="flex-1 bg-[#F5F8FC]">
      {(loggingOut || isInitializing) && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/30">
          <ActivityIndicator color="#fff" size="large" />
          <Text className="mt-2 text-white">正在处理，请稍候...</Text>
        </View>
      )}

      <LinearGradient
        colors={['#E7F2FF', '#FFF']}
        className="absolute w-full"
        style={{
          top: '15%',
          height: '85%',
        }}
      />
      <Image
        source={require('~/assets/images/who/bg.png')}
        className="absolute aspect-[395/186] w-full"
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
            icon={require('~/assets/images/who/vip.png')}
            title="会员充值"
            href="/membership"
          />
          {userInfo?.tutorType === '用户' ? (
            <MenuItem
              icon={require('~/assets/images/who/join.png')}
              title="申请入驻"
              href="/become-mentor"
            />
          ) : (
            <MenuItem
              icon={require('~/assets/images/who/join.png')}
              title="导师入口"
              href="/tutor-entrance"
            />
          )}

          <MenuItem
            icon={require('~/assets/images/who/customer-service.png')}
            title="人工客服"
            href="/support"
          />
          <MenuItem
            icon={require('~/assets/images/who/platform-message.png')}
            title="平台消息"
            href="/platform-message"
          />
          <Pressable
            onPress={() => setShowCreateGroupModal(true)}
            className="flex-row items-center px-4 py-4">
            <Image
              source={require('~/assets/images/who/update.png')}
              className="h-5 w-5"
              contentFit="contain"
            />
            <Text className="ml-4 flex-1">测试创建群聊</Text>
          </Pressable>
          <Pressable
            onPress={handleCreateAchievementBook}
            className="flex-row items-center px-4 py-4">
            <Image
              source={require('~/assets/images/who/update.png')}
              className="h-5 w-5"
              contentFit="contain"
            />
            <Text className="ml-4 flex-1">测试创建成就书</Text>
          </Pressable>
          {/* <Pressable
            onPress={() => onButtonClicked()}
            // disabled={true}
            className="flex-row items-center px-4 py-4">
            <Image
              source={require('~/assets/images/who/update.png')}
              className="h-5 w-5"
              contentFit="contain"
            />
            <Text className="ml-4 flex-1">检测更新</Text>
          </Pressable> */}
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            className="flex-row items-center px-4 py-4">
            <Image
              source={require('~/assets/images/who/logout.png')}
              className="h-5 w-5"
              contentFit="contain"
            />
            <Text className="ml-4 flex-1">退出登录</Text>
          </Pressable>
        </View>

        {/* 版本信息 */}
        <Text className="mb-4 mt-[120px] text-center text-xs text-[#999]">Wisdom Light v1.0.0</Text>
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
                {editType === 'nickname' ? '编辑昵称' : '编辑用ID'}
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

      {/* 退出登录确认弹窗 */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-10">
          <View className="h-[200px] w-full rounded-lg bg-white py-6">
            <View className="flex-1 items-center justify-center">
              <Text className="text-center text-[16px]">确认退出登录?</Text>
            </View>
            <View className="h-[50px] flex-row justify-between px-4 ">
              <Pressable
                onPress={() => setShowLogoutModal(false)}
                className="h-full w-[45%] items-center justify-center rounded-lg border border-gray-200">
                <Text>取消</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="h-full w-[45%] items-center justify-center rounded-lg border border-gray-200">
                <Text className="">确认</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 创建群聊弹窗 */}
      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateGroupModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-10">
          <View className="w-full rounded-lg bg-white p-6">
            <Text className="mb-4 text-center text-lg font-medium">创建群聊</Text>
            <View className="mb-4">
              <Text className="mb-2 text-gray-600">群聊名称</Text>
              <TextInput
                value={groupTitle}
                onChangeText={setGroupTitle}
                className="rounded-lg border border-gray-200 p-3"
                placeholder="请输入群聊名称"
                maxLength={20}
              />
            </View>
            <View className="mb-4">
              <Text className="mb-2 text-gray-600">群聊描述</Text>
              <TextInput
                value={groupDescription}
                onChangeText={setGroupDescription}
                className="rounded-lg border border-gray-200 p-3"
                placeholder="请输入群聊描述"
                maxLength={100}
                multiline
                numberOfLines={3}
              />
            </View>
            <View className="flex-row justify-between space-x-4">
              <Pressable
                onPress={() => setShowCreateGroupModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2">
                <Text className="text-center">取消</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateGroup}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2">
                <Text className="text-center text-white">创建</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View className="h-[1px] bg-gray-100" />
    </View>
  );
}
