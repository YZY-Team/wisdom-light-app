import { Dialog } from '~/types/have/dialogType';
import { request } from '~/utils/request';

export const dialogApi = {
  // 获取对话列表
  getDialogs: () => {
    return request.get<Dialog[]>('/dialogs');
  },

  // 获取群聊列表
  getGroupDialogs: () => {
    return request.get<Dialog[]>('/dialogs/group');
  },

  // 获取单个对话详情
  getDialogInfo: (id: string) => {
    return request.get<Dialog>(`/dialogs/${id}`);
  },

  // 创建私聊
  createDialog: (targetUserId: string) => {
    const formData = new URLSearchParams();
    formData.append('targetUserId', targetUserId);
    return request.post<string>('/dialogs/private', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // 创建群聊
  createGroupDialog: (data: {
    title: string;
    avatarUrl: string;
    memberIds: string[];
    description: string;
  }) => {
    return request.post<string>('/dialogs/group', data);
  },

  // 删除对话
  deleteDialog: (id: string) => {
    return request.delete(`/api/dialogs/${id}`);
  },

  // 获取群聊成员信息
  getGroupMembers: (dialogId: string) => {
    return request.get(`/dialogs/group/${dialogId}/members`);
  },

  // 添加群聊成员
  addGroupMembers: (dialogId: string, memberIds: string[]) => {
    return request.post(`/dialogs/group/${dialogId}/members`, memberIds);
  },

  // 加入聊天广场
  joinChatSquare: () => {
    return request.post(`/dialogs/square`);
  },
};

// 定义通话响应类型
interface CallResponse {
  code: number;
  data: {
    callId: string;
    callType: 'VIDEO' | 'AUDIO';
    callerId: string;
    iceServers: string;
    receiverId: string;
    sessionId: string;
    signalingServer: string;
    startTime: string;
    status: string;
  };
  message: string;
}

// post /friends/calls/initiate
export const initiateCall = ({ callerId, receiverId, callType }: { callerId: string; receiverId: string; callType: string }) => {
  return request.post<CallResponse>('/friends/calls/initiate', { callerId, receiverId, callType });
};

// put /friends/calls/{callId}/cancel
export const cancelCall = (callId: string) => {
  return request.put(`/friends/calls/${callId}/cancel`);
};

// put /friends/calls/sessions/{sessionId}/end
export const endCall = (sessionId: string) => {
  return request.put(`/friends/calls/sessions/${sessionId}/end`);
};

// put /friends/calls/{callId}/accept
export const acceptCall = (callId: string) => {
  return request.put(`/friends/calls/${callId}/accept`);
};

export const verificationApi = {
  getCode: (phone: string) => {
    return request.post('/api/auth/verification-code', { phone });
  },
};
