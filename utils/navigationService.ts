import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 创建导航引用
export const navigationRef = createRef<NavigationContainerRef<any>>();

// 导航方法
export function navigate(name: string, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

// 重置路由栈并导航到指定页面
export function reset(name: string) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name }],
    });
  }
}

// 登出方法
export async function logout() {
  // 清除token
  await AsyncStorage.removeItem('token');
  // 重置路由并导航到登录页
  reset('login');
} 