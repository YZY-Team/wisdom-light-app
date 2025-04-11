import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

// 定义消息类型
export type Message = {
  type: string;
  dialogId: string; // 支持字符串或数字类型
  receiverId: string;
  senderId: string;
  textContent: string;
  status ?: 'CREATED' | 'SENT' | 'DELIVERED' | 'READ'; // 根据需要扩展状态
  timestamp: string;
};

// Store 的状态和方法
type WebSocketState = {
  messages: Record<string, Message[]>; // 按 dialogId 存储消息
  addMessage: (message: Message) => void;
  clearMessages: (dialogId: string) => void;
  markMessagesAsRead: (dialogId: string, userId: string) => void; // 新增方法
};

const MESSAGES_STORAGE_KEY = '@messages';

// 加载持久化的消息
const loadPersistedMessages = async (): Promise<Record<string, Message[]>> => {
  try {
    const savedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : {};
  } catch (error) {
    console.error('加载消息失败:', error);
    return {};
  }
};

export const useWebSocketStore = create<WebSocketState>((set) => ({
  messages: {},
  addMessage: (message) =>
    set((state) => {
      let parsedMessage: Message;
      const currentUserId = useUserStore.getState().userInfo?.globalUserId;

      if (typeof message === 'string') {
        try {
          parsedMessage = JSON.parse(message);
          parsedMessage.dialogId = String(parsedMessage.dialogId);
          parsedMessage.receiverId = String(parsedMessage.receiverId);
          parsedMessage.senderId = String(parsedMessage.senderId);
          parsedMessage.status = parsedMessage.senderId === currentUserId ? 'READ' : 'CREATED';
        } catch (e) {
          console.error('消息解析失败:', e);
          return state;
        }
      } else {
        parsedMessage = {
          ...message,
          dialogId: String(message.dialogId),
          receiverId: String(message.receiverId),
          senderId: String(message.senderId),
          status: message.senderId === currentUserId ? 'READ' : 'CREATED',
        };
      }

      const dialogId = parsedMessage.dialogId;
      const newMessages = {
        ...state.messages,
        [dialogId]: [...(state.messages[dialogId] || []), parsedMessage],
      };

      // 持久化更新
      AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages)).catch((error) =>
        console.error('保存消息失败:', error)
      );

      return { messages: newMessages };
    }),
  clearMessages: (dialogId) =>
    set((state) => {
      const newMessages = {
        ...state.messages,
        [dialogId]: [],
      };

      // 持久化更新后的消息
      AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages));

      return { messages: newMessages };
    }),
  // 添加标记消息为已读的方法
  markMessagesAsRead: (dialogId: string, userId: string) =>
    set((state) => {
      const dialogMessages = state.messages[dialogId];
      if (!dialogMessages) return state;
      console.log('dialogMessages', dialogMessages);
      const updatedMessages = dialogMessages.map((msg) =>
        msg.senderId === userId && msg.status !== 'READ'
          ? { ...msg, status: 'READ' as const }
          : msg
      );

      const newMessages = {
        ...state.messages,
        [dialogId]: updatedMessages,
      };

      // 持久化更新
      AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages)).catch((error) =>
        console.error('更新消息状态失败:', error)
      );

      return { messages: newMessages };
    }),
}));

// 初始化加载持久化的消息
loadPersistedMessages().then((savedMessages) => {
  useWebSocketStore.setState({ messages: savedMessages });
});
