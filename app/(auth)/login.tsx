import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginApi } from '~/api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { userApi } from '~/api/who/user';
import { useUserStore } from '~/store/userStore';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Keyboard, KeyboardEvent } from 'react-native';
import { verificationApi } from '~/api/auth/verification';
import { useDatabase } from '~/contexts/DatabaseContext';
import { cssInterop } from 'nativewind';
import { friendApi } from '~/api/have/friend';
import * as schema from '~/db/schema';
import { useAuthStore } from '~/store/authStore';

cssInterop(LinearGradient, { className: { target: 'style' } });

export default function Login() {
  const insets = useSafeAreaInsets();
  const { initialize, isInitializing, drizzleDb } = useDatabase();

  const [isChecked, setChecked] = useState(false);
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showError, setShowError] = useState(false); // 添加错误状态
  const wsContext = useWebSocketContext();

  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // 添加倒计时状态

  // 组件加载时检查保存的手机号码
  useEffect(() => {
    const loadSavedPhone = async () => {
      try {
        const savedPhone = await AsyncStorage.getItem('savedPhone');
        if (savedPhone) {
          setPhone(savedPhone);
        }
      } catch (error) {
        console.error('加载保存的手机号码失败:', error);
      }
    };
    loadSavedPhone();
  }, []);

  const handleRegister = async () => {
    console.log('注册');

    // 验证手机号
    if (!phone) {
      alert('请输入手机号');
      return;
    }

    // 验证验证码
    if (!verificationCode) {
      alert('请输入验证码');
      return;
    }

    // 验证隐私协议
    if (!isChecked) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setLoading(true);

    try {
      console.log('注册信息：', { phone, verificationCode });
      const loginRes = await loginApi.login({ phone, code: verificationCode });
      console.log('登录成功', loginRes);
      if (loginRes.code === 200) {
        // 使用 AsyncStorage 存储 token
        await AsyncStorage.setItem('token', loginRes.data);

        // 获取用户信息
        const userRes = await userApi.me();
        if (userRes.code === 200 && userRes.data) {
          // 存储用户ID
          await AsyncStorage.setItem('globalUserId', userRes.data.globalUserId);
          // 保存手机号码
          await AsyncStorage.setItem('savedPhone', phone);

          // 使用用户ID初始化数据库
          await initialize(userRes.data.globalUserId);

          wsContext.connect(userRes.data.globalUserId);

          // 确保数据库初始化完成后再拉取好友列表
          if (!drizzleDb) {
            console.error('数据库未正确初始化');
            return;
          }

          // 登录成功后立即拉取好友列表
          try {
            const friendRes = await friendApi.getFriends();
            if (friendRes.code === 200 && friendRes.data) {
              console.log('成功拉取好友列表，准备缓存');
              const friends = friendRes.data;

              if (friends && friends.length > 0 && userRes.data.globalUserId && drizzleDb) {
                console.log('开始同步好友数据到本地数据库');

                // 同步用户数据
                for (const friend of friends) {
                  if (!friend.userId) continue;

                  await drizzleDb
                    .insert(schema.users)
                    .values({
                      id: friend.userId,
                      nickname: friend.nickname || null,
                      avatarLocalPath: null,
                      avatarRemoteUrl: friend.originalAvatarUrl || friend.avatarUrl,
                    })
                    .onConflictDoUpdate({
                      target: schema.users.id,
                      set: {
                        nickname: friend.nickname || null,
                        avatarRemoteUrl: friend.originalAvatarUrl || friend.avatarUrl,
                      },
                    });

                  // 同步好友关系
                  if (!friend.createTime) continue;

                  await drizzleDb
                    .insert(schema.friends)
                    .values({
                      userId: userRes.data.globalUserId,
                      friendId: friend.userId,
                      username: friend.username,
                      nickname: friend.nickname,
                      remark: friend.remark,
                      avatarUrl: friend.avatarUrl,
                      originalAvatarUrl: friend.originalAvatarUrl,
                      customAvatarUrl: friend.customAvatarUrl,
                      isFavorite: friend.isFavorite,
                      createTime: friend.createTime,
                    })
                    .onConflictDoUpdate({
                      target: [schema.friends.userId, schema.friends.friendId],
                      set: {
                        nickname: friend.nickname,
                        remark: friend.remark,
                        avatarUrl: friend.avatarUrl,
                        originalAvatarUrl: friend.originalAvatarUrl,
                        customAvatarUrl: friend.customAvatarUrl,
                        isFavorite: friend.isFavorite,
                      },
                    });
                }
                console.log('好友数据同步完成');
              }
            }
          } catch (error) {
            console.error('拉取好友列表失败:', error);
          }
        }
        console.log('用户信息：', userRes);
        // 建立WebSocket连接
        setUserInfo(userRes.data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      // router.replace('(tabs)/do');
      alert('登录失败：' + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理获取验证码
   * 调用验证码API发送验证码到用户手机
   */
  const handleGetVerificationCode = async () => {
    if (!phone) {
      alert('请输入手机号');
      return;
    }
    try {
      const res = await verificationApi.getCode(phone);

      if (res.code === 200) {
        alert('验证码已发送');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // 保存定时器ID以便清理
        return () => clearInterval(timer);
      } else {
        alert('获取验证码失败：' + res.message);
      }
    } catch (error) {
      alert('获取验证码失败：' + error);
    }
  };

  // 添加清理定时器的useEffect
  useEffect(() => {
    return () => {
      // 组件卸载时重置倒计时
      setCountdown(0);
    };
  }, []);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardWillShow', (e: KeyboardEvent) => {
      console.log('键盘高度：', e.endCoordinates.height);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('键盘隐藏');
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView className="flex-1" behavior={'padding'} style={{ flex: 1 }}>
      {(loading || isInitializing) && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <ActivityIndicator size="large" color="#1483FD" />
          <Text className="mt-2 text-white">正在处理，请稍候...</Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={['#20B4F3', '#5762FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex min-h-screen">
          <View
            className="flex items-center   justify-center px-4"
            style={{
              height: keyboardHeight > 0 ? '20%' : '50%',
            }}>
            <Text
              className="text-[8.205vw] text-white"
              style={{
                fontFamily: 'Inter',
                fontWeight: '700',
              }}>
              Wisdom Light
            </Text>
          </View>

          <View
            className="flex-1 rounded-t-[40px] bg-white px-4"
            style={{
              minHeight: keyboardHeight > 0 ? '80%' : '50%',
            }}>
            <View className="flex-1 pt-14">
              <View className="flex flex-col gap-6">
                <View>
                  <Text
                    className="mb-2 text-black"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 16,
                      fontWeight: '700',
                    }}>
                    手机号
                  </Text>
                  <TextInput
                    className="h-[48px] rounded-[6px] px-4"
                    style={{
                      backgroundColor: 'rgba(20, 131, 253, 0.05)',
                    }}
                    placeholder="请输入您的手机号"
                    placeholderTextColor="#999999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="">
                  <Text
                    className="mb-2 text-black"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 16,
                      fontWeight: '700',
                    }}>
                    验证码
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="h-[48px] rounded-[6px] px-4 pr-24"
                      style={{
                        backgroundColor: 'rgba(20, 131, 253, 0.05)',
                      }}
                      placeholder="请输入验证码"
                      placeholderTextColor="#999999"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                    />
                    <View className="absolute right-2 top-[6px]">
                      <LinearGradient
                        colors={
                          countdown > 0
                            ? ['rgba(32, 180, 243, 0.50)', 'rgba(87, 98, 255, 0.50)']
                            : ['#20B4F3', '#5762FF']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-[6px]"
                        style={{
                          boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                        }}>
                        <Pressable
                          onPress={handleGetVerificationCode}
                          disabled={countdown > 0}
                          className="h-[36px] items-center justify-center px-4">
                          <Text className="text-[14px] text-white">
                            {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                          </Text>
                        </Pressable>
                      </LinearGradient>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View
              className="flex flex-col items-center gap-1 "
              style={{
                paddingBottom: insets.bottom + 33 || 33,
              }}>
              <View className="flex-row items-center">
                <Checkbox
                  className="mr-2 h-4 w-4 rounded border-none bg-[#D9D9D9]"
                  value={isChecked}
                  onValueChange={(value) => {
                    setChecked(value);
                    setShowError(false);
                  }}
                />

                <Text className="text-sm text-gray-500">
                  <Text className="text-[#1687FD]">《隐私政策》</Text>
                  <Text className="text-gray-500">与</Text>
                  <Text className="text-[#1687FD]">《服务协议》</Text>
                  同意选项
                </Text>
              </View>

              <Text
                className="h-5 text-sm text-red-500"
                style={{
                  opacity: showError ? 1 : 0,
                }}>
                请勾选隐私政策与服务协议
              </Text>

              <View className="w-full items-center px-4">
                <LinearGradient
                  colors={
                    isChecked && phone && verificationCode
                      ? ['#20B4F3', '#5762FF']
                      : ['rgba(32, 180, 243, 0.50)', 'rgba(87, 98, 255, 0.50)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full"
                  style={{
                    boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}>
                  <Pressable
                    onPress={handleRegister}
                    disabled={!isChecked || !phone || !verificationCode}
                    className="h-[44px] items-center justify-center">
                    <Text
                      className="text-center text-[5.128vw] text-white"
                      style={{
                        fontWeight: '700',
                      }}>
                      登录
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
