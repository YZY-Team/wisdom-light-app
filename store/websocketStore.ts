import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

// 定义消息类型
export type Message = {
  type: 'PRIVATE_CHAT' | 'GROUP_CHAT' | 'SYSTEM';
  dialogId?: string; // 私聊时使用
  groupId?: string; // 群聊时使用
  receiverId?: string; // 私聊时使用
  senderId: string;
  textContent: string;
  status?: 'CREATED' | 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
  imageUrl?: string; // 图片消息URL
  audioUrl?: string; // 音频消息URL
  readBy?: string[]; // 群聊消息已读用户ID列表
};

// Store 的状态和方法
type WebSocketState = {
  messages: Record<string, Message[]>; // 按 dialogId 或 groupId 存储消息
  addMessage: (message: Message) => void;
  clearMessages: (dialogId: string) => void;
  markMessagesAsRead: (dialogId: string, userId: string) => void;
};

const MESSAGES_STORAGE_KEY = '@messages';

// 加载持久化的消息
const loadPersistedMessages = async (): Promise<Record<string, Message[]>> => {
  try {
    const savedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : {};
  } catch (error) {
    console.log('加载消息失败:', error);
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
          // 根据消息类型设置正确的ID
          if (parsedMessage.type === 'GROUP_CHAT') {
            parsedMessage.groupId = String(parsedMessage.groupId);
          } else {
            parsedMessage.dialogId = String(parsedMessage.dialogId);
            parsedMessage.receiverId = String(parsedMessage.receiverId);
          }
          parsedMessage.senderId = String(parsedMessage.senderId);
          parsedMessage.status = parsedMessage.senderId === currentUserId ? 'READ' : 'CREATED';
          // 初始化已读用户数组
          if (parsedMessage.type === 'GROUP_CHAT') {
            parsedMessage.readBy = parsedMessage.senderId === currentUserId ? [currentUserId] : [];
          }
        } catch (e) {
          // console.log('消息解析失败:', message);
          return state;
        }
      } else {
        parsedMessage = {
          ...message,
          // 使用 dialogId 作为群聊消息的 key
          dialogId: String(message.dialogId),
          senderId: String(message.senderId),
          status: message.senderId === currentUserId ? 'READ' : 'CREATED',
          // 初始化已读用户数组
          readBy: message.type === 'GROUP_CHAT' 
            ? (message.senderId === currentUserId ? [currentUserId] : (message.readBy || []))
            : undefined,
        };
      }

      // 使用 dialogId 作为消息存储的 key
      const messageKey = parsedMessage.dialogId;
      if (!messageKey) {
        console.error('消息缺少必要的ID');
        return state;
      }

      console.log('保存消息:', { messageKey, parsedMessage });

      // 检查是否已存在相同消息，避免重复
      const existingMessages = state.messages[messageKey] || [];
      const isDuplicate = existingMessages.some(msg => 
        // 比较关键字段以确定是否为重复消息
        msg.senderId === parsedMessage.senderId && 
        msg.textContent === parsedMessage.textContent && 
        msg.timestamp === parsedMessage.timestamp
      );
      
      if (isDuplicate) {
        console.log('检测到重复消息，跳过添加');
        return state;
      }

      const newMessages = {
        ...state.messages,
        [messageKey]: [...existingMessages, parsedMessage],
      };

      // 持久化更新
      AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages)).catch((error) =>
        console.log('保存消息失败:', error)
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
      if (!dialogMessages || !userId) return state;
      
      const updatedMessages = dialogMessages.map((msg) => {
        // 私聊消息处理
        if (msg.type === 'PRIVATE_CHAT') {
          // 如果消息是别人发给我的，且状态不是已读，则标记为已读
          if (msg.senderId !== useUserStore.getState().userInfo?.globalUserId && msg.status !== 'READ') {
            return { ...msg, status: 'READ' as const };
          }
        }
        
        // 群聊消息处理
        if (msg.type === 'GROUP_CHAT') {
          // 确保readBy数组存在
          const readBy = msg.readBy || [];
          // 如果当前用户不在已读列表中，添加到已读列表
          if (!readBy.includes(userId)) {
            return { ...msg, readBy: [...readBy, userId] };
          }
        }
        
        return msg;
      });

      const newMessages = {
        ...state.messages,
        [dialogId]: updatedMessages,
      };

      // 持久化更新
      AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(newMessages)).catch((error) =>
        console.log('更新消息状态失败:', error)
      );

      return { messages: newMessages };
    }),
}));

// 初始化加载持久化的消息
loadPersistedMessages().then((savedMessages) => {
  useWebSocketStore.setState({ messages: savedMessages });
});
