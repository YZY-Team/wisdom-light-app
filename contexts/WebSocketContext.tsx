import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useWebSocketStore } from '~/store/websocketStore';
import { useFriendRequestStore } from '~/store/friendRequestStore';
import { router } from 'expo-router';
import { useUserStore } from '~/store/userStore';
import { useQueryClient } from '@tanstack/react-query';

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
  const { addMessage } = useWebSocketStore();
  const { userInfo } = useUserStore();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (userInfo) {
      connect(userInfo.globalUserId);
    }
  }, [userInfo]);
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
        queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      }

      // 处理视频通话请求
      if (data.type === 'SYSTEM' && data.title === '视频通话请求') {
        const callerId = data.content.match(/用户ID: (\d+)/)?.[1];
        const callId = data.content.match(/通话ID: ([^,\s]+)/)?.[1];
        console.log('系统通话请求 - callerId:', callerId);
        console.log('系统通话请求 - callId:', callId);
        if (callerId) {
          // 导航到通话页面
          router.push({
            pathname: '/(pages)/private-rtc',
            params: {
              mode: 'video',
              isHost: 'false',
              callerId,
              callId,
            },
          });
        }
      }
      if (data.type === 'SYSTEM' && data.title === '通话已取消') {
        const callerId = data.content.match(/用户ID: (\d+)/)?.[1];
        const callId = data.content.match(/通话ID: ([^,\s]+)/)?.[1];
        console.log('系统通话请求已取消 - callerId:', callerId);
        console.log('系统通话请求已取消 - callId:', callId);
        router.back();
      }
      if (data.type === 'SYSTEM' && data.title === '通话已接通') {
        const callerId = data.content.match(/用户ID: (\d+)/)?.[1];
        const callId = data.content.match(/通话ID: ([^,\s]+)/)?.[1];
        console.log('系统通话请求已接受 - callerId:', callerId);
        console.log('系统通话请求已接受 - callId:', callId);
        router.push({
          pathname: '/(pages)/private-rtc',
          params: {
            mode: 'video',
            isHost: 'true',
            callerId,
            callId,
          },
        });
      }

      await addMessage(event.data);
    },
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
    retryOnError: true,
    share: true,
  });

  const connect = useCallback((userId: string) => {
    setSocketUrl(`ws://119.29.188.102:8080/ws/message?userId=${userId}`);
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
