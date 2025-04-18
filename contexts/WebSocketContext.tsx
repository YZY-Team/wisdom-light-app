import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useWebSocketStore } from '~/store/websocketStore';
import { useFriendRequestStore } from '~/store/friendRequestStore';
type WebSocketContextType = {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent | null;
  readyState: ReadyState;
  connect: (userId: string) => void;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const { setShouldRefresh } = useFriendRequestStore();
  const { addMessage } = useWebSocketStore();
  
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('WebSocket 连接已建立');
    },
    onClose: () => {
      console.log('WebSocket 连接已关闭');
    },
    onError: (error) => {
      console.log('WebSocket 错误:', error);
    },
    onMessage: async (event) => {
      console.log('收到消息:', event.data);
      const data = JSON.parse(event.data);
      
      // 处理好友请求相关的系统消息
      if (data.type === 'SYSTEM' && data.title === '添加好友') {
        setShouldRefresh(true);
      }
      
      await addMessage(event.data);
    },
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 30000,
    retryOnError: true,
    share: true,
  });

  const connect = useCallback((userId: string) => {
    setSocketUrl(`ws://192.168.1.158:8108/ws/message?userId=${userId}`);
  }, []);

  const disconnect = useCallback(() => {
    const ws = getWebSocket();
    if (ws) {
      ws.close();
    }
    setSocketUrl(null);
  }, [getWebSocket]);

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        lastMessage,
        readyState,
        connect,
        disconnect,
      }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
