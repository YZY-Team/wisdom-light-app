import { create } from 'zustand';

// 定义消息类型
type Message = {
  type: 'PRIVATE_CHAT';
  dialogId: number;
  receiverId: number;
  senderId: number;
  textContent: string;
  status: 'CREATED' | 'SENT' | 'DELIVERED' | 'READ'; // 根据需要扩展状态
  timestamp: number;
};

// Store 的状态和方法
type WebSocketState = {
  messages: Record<string, Message[]>; // 按 dialogId 存储消息
  addMessage: (message: Message) => void;
  clearMessages: (dialogId: string) => void;
};

export const useWebSocketStore = create<WebSocketState>((set) => ({
  messages: {}, // 初始化为空对象
  addMessage: (message) =>
    set((state) => {
      const dialogId = message.dialogId.toString(); // 使用 dialogId 作为键
      return {
        messages: {
          ...state.messages,
          [dialogId]: [...(state.messages[dialogId] || []), message], // 添加新消息
        },
      };
    }),
  clearMessages: (dialogId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [dialogId]: [], // 清空指定 dialogId 的消息
      },
    })),
}));
