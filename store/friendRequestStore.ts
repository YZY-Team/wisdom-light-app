import { create } from 'zustand';

type FriendRequestStore = {
  shouldRefresh: boolean;
  setShouldRefresh: (value: boolean) => void;
};

export const useFriendRequestStore = create<FriendRequestStore>((set) => ({
  shouldRefresh: false,
  setShouldRefresh: (value) => set({ shouldRefresh: value }),
}));