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

  // 创建新对话
  createDialog: (title: string) => {
    return request.post('/api/dialogs', { title });
  },

  // 删除对话
  deleteDialog: (id: string) => {
    return request.delete(`/api/dialogs/${id}`);
  },
};

export const verificationApi = {
  getCode: (phone: string) => {
    return request.post('/api/auth/verification-code', { phone });
  },
};
