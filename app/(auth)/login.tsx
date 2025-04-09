import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginApi } from '~/api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { userApi } from '~/api/who/user';
// 删除 SecureStore import
// import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [phone, setPhone] = useState('+8619232040670');
  const [verificationCode, setVerificationCode] = useState('123456');
  const wsContext = useWebSocketContext();
  const handleRegister = async () => {
    try {
      console.log('注册信息：', { username, phone, verificationCode });
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
          // 建立WebSocket连接
          
          wsContext.connect(userRes.data.globalUserId);
        }
        
        router.replace('/(tabs)/have');
      }
    } catch (error) {
      console.error('登录失败：', error);
    }
  };

  const handleGetVerificationCode = () => {
    // 获取验证码逻辑
    console.log('获取验证码', phone);
  };

  return (
    <LinearGradient
      colors={['#20B4F3', '#5762FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="flex-1">
      <View className="flex h-[144px] items-center justify-center px-4">
        <Text
          className="text-[8.205vw] text-white"
          style={{
            fontFamily: 'Inter',
            fontWeight: '700',
          }}>
          Wisdom Light
        </Text>
      </View>

      <View className="flex-1 rounded-t-[40px] bg-white px-4">
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
                placeholder="+86  请输入您的手机号"
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
                    colors={['#20B4F3', '#5762FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-[6px]"
                    style={{
                      boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
                    }}>
                    <Pressable
                      onPress={handleGetVerificationCode}
                      className="h-[36px] items-center justify-center px-4">
                      <Text className="text-[14px] text-white">获取验证码</Text>
                    </Pressable>
                  </LinearGradient>
                </View>
              </View>
              <Text className="mt-1 text-[12px] text-[#1687FD] underline">忘记密码</Text>
            </View>
          </View>
        </View>

        <View
          className="flex flex-col items-center gap-4 "
          style={{
            paddingBottom: insets.bottom + 33 || 33,
          }}>
          <View className="flex-row items-center">
            <Checkbox
              className="mr-2 h-4 w-4 rounded   border-none bg-[#D9D9D9]"
              value={isChecked}
              onValueChange={setChecked}
            />

            <Text className="text-sm text-gray-500">
              <Text className="text-[#1687FD]">《隐私政策》</Text>
              <Text className="text-gray-500">与</Text>
              <Text className="text-[#1687FD]">《服务协议》</Text>
              同意选项
            </Text>
          </View>

          <View className="items-center">
            <LinearGradient
              colors={['#20B4F3', '#5762FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-[358px] rounded-[6px]"
              style={{
                shadowColor: 'rgba(20, 131, 253, 0.40)',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 1,
                shadowRadius: 10,
                elevation: 5,
              }}>
              <Pressable onPress={handleRegister} className="h-[44px] items-center justify-center">
                <Text
                  className="text-center text-[5.128vw] text-white"
                  style={{
                    fontFamily: 'Inter',
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
  );
}
