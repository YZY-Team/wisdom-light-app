import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserInfo = {
  globalUserId: string;
  isBuy: boolean;
  isInvite: boolean | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  platformName: string;
  platformUserId: string;
  platformUsername: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  username: string | null;
  avatarUrl: string | null;
  webInviteUrl: string | null;
  isBlacklist: boolean;
  accountRole: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  loginTime: string;
};

type UserState = {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
};

const USER_STORAGE_KEY = '@user_info';

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  setUserInfo: (info) => {
    set({ userInfo: info });
    AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(info));
  },
  clearUserInfo: () => {
    set({ userInfo: null });
    AsyncStorage.removeItem(USER_STORAGE_KEY);
  },
}));

// 初始化加载持久化的用户信息
AsyncStorage.getItem(USER_STORAGE_KEY).then((savedInfo) => {
  if (savedInfo) {
    useUserStore.setState({ userInfo: JSON.parse(savedInfo) });
  }
});