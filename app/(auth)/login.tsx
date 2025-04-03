import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 这里添加实际的登录逻辑
    try {
      // 模拟登录请求
      console.log('登录信息：', { username, password });
      // 登录成功后跳转到主页面
      router.replace('/(tabs)/have');
    } catch (error) {
      console.error('登录失败：', error);
    }
  };

  return (
    <View className="flex-1 justify-center px-4 bg-white dark:bg-gray-900">
      <View className="space-y-4">
        <Text className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          欢迎登录
        </Text>
        <TextInput
          className="p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="用户名"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          className="p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable
          onPress={handleLogin}
          className="bg-blue-500 p-4 rounded-lg active:opacity-80"
        >
          <Text className="text-white text-center font-semibold">
            登录
          </Text>
        </Pressable>
      </View>
    </View>
  );
}