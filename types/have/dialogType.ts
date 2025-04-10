// 对话类型枚举
export enum DialogType {
  Type1 = '1',
  Type2 = '2',
  Type3 = '3'
}

// 对话信息
export interface Dialog {
  dialogId: number;
  dialogType: DialogType;
  title?: string;
  avatarUrl?: string;
  createdAt: string; // ISO 日期时间格式
  lastMessageId?: number;
  lastMessageContent?: string;
  lastMessageSenderId?: number;
  lastMessageSenderName?: string;
  lastMessageTime?: string; // ISO 日期时间格式
  unreadCount?: number;
  isMuted?: boolean;
  memberCount?: number;
  creatorId: number;
}

