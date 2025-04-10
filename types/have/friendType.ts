// 好友信息
export interface Friend {
  id: number;
  userId: number;
  friendId: number;
  remark?: string;
  customAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindFriend {
  globalUserId: string;
  username: string;
  nickname: string;
  avatarUrl: string;
}
// 好友请求信息
export interface FriendRequest {
  requestId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  requestMessage: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createTime: string;
}

// 更新好友信息DTO
export interface UpdateFriendInfoDTO {
  remark?: string;
  customAvatarUrl?: string;
}

// 发送好友请求DTO
export interface FriendRequestDTO {
  senderId: number;
  receiverId: number;
  requestMessage?: string;
}

// 好友列表响应
export interface FriendListResponse {
  code: number;
  message: string;
  data: Friend[];
}

// 好友请求列表响应
export interface FriendRequestListResponse {
  code: number;
  message: string;
  data: FriendRequest[];
}

// 好友关系检查响应
export interface FriendshipCheckResponse {
  code: number;
  message: string;
  data: boolean;
}
