import { Friend, FriendRequest } from '~/types/have/friendType';
import { request } from '~/utils/request';

export const friendApi = {
  // 获取好友列表
  getFriends: () => {
    return request.get<Friend[]>('/friends');
  },
  // 获取好友请求列表

  // 查找好友
  findFriends: (username: string) => {
    return request.get<Friend[]>('/friends/find', { params: { username } });
  },

  // 获取单个好友信息
  getFriend: (id: string) => {
    return request.get<Friend>(`/friends/${id}`);
  },

  // 更新好友信息
  updateFriend: (id: string, data: { remark?: string; customAvatarUrl?: string }) => {
    return request.put(`/friends/${id}`, data);
  },

  // 删除好友
  deleteFriend: (id: string) => {
    return request.delete(`/friends/${id}`);
  },

  // 获取已发送的好友请求
  getSentRequests: () => {
    return request.get<FriendRequest[]>('/friends/requests/sent');
  },

  // 获取待处理的好友请求
  getPendingRequests: () => {
    return request.get<FriendRequest[]>('/friends/requests/pending');
  },

  // 发送好友请求
  sendRequest: (data: { senderId: number; receiverId: number; requestMessage?: string }) => {
    return request.post('/friends/requests', data);
  },

  // 接受好友请求
  acceptRequest: (requestId: string) => {
    return request.put(`/friends/requests/${requestId}/accept`);
  },

  // 拒绝好友请求
  rejectRequest: (requestId: string) => {
    return request.put(`/friends/requests/${requestId}/reject`);
  },

  // 取消好友请求
  cancelRequest: (requestId: string) => {
    return request.delete(`/friends/requests/${requestId}`);
  },

  // 检查好友关系
  checkFriendship: (targetUserId: string) => {
    return request.get<boolean>(`/friends/check/${targetUserId}`);
  }
};