import { Dialog } from '~/types/have/dialogType';
import { request } from '~/utils/request';

export const dialogApi = {
  // 获取对话列表
  getDialogs: () => {
    return request.get<Dialog[]>('/dialogs');
  },

  // 获取单个对话详情
  getDialog: (id: string) => {
    return request.get<Dialog>(`/api/dialogs/${id}`);
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

  // 删除对话
  deleteDialog: (id: string) => {
    return request.delete(`/api/dialogs/${id}`);
  },
};

// post /friends/calls/initiate
export const initiateCall = ({ callerId, receiverId, callType }: { callerId: number; receiverId: number; callType: string }) => {
  return request.post('/friends/calls/initiate', { callerId, receiverId, callType });
};

export const verificationApi = {
  getCode: (phone: string) => {
    return request.post('/api/auth/verification-code', { phone });
  },
};
