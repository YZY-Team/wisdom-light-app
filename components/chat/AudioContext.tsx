import { createContext } from 'react';

// 创建音频上下文来管理当前播放的消息
export const AudioContext = createContext<{
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
}); 