import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  dialogId: text('dialog_id').primaryKey(), // 对话的唯一标识符
  type: text('type').notNull(), // 对话类型：'PRIVATE_CHAT'（私聊）或'GROUP_CHAT'（群聊）
  participantId: text('participant_id').notNull(), // 参与者ID：私聊时为用户ID，群聊时为群组ID
  lastMessageContent: text('last_message_content'), // 最后一条消息的内容
  lastMessageTime: integer('last_message_time'), // 最后一条消息的时间戳
  unreadCount: integer('unread_count').default(0), // 未读消息数量
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false), // 是否置顶对话
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(), // 消息的唯一标识符
  dialogId: text('dialog_id')
    .notNull()
    .references(() => conversations.dialogId), // 所属对话的ID
  senderId: text('sender_id').notNull(), // 发送者的ID
  receiverId: text('receiver_id'), // 接收者的ID（私聊时使用）
  textContent: text('text_content'), // 消息内容
  type: text('type').notNull(), // 消息类型：'PRIVATE_CHAT', 'GROUP_CHAT'等
  timestamp: integer('timestamp').notNull(), // 消息发送的时间戳
  status: text('status'), // 消息状态：'sent'（已发送）, 'delivered'（已送达）, 'read'（已读）
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // 用户的唯一标识符
  nickname: text('nickname'), // 用户昵称
  avatarLocalPath: text('avatar_local_path'), // 头像本地存储路径
  avatarRemoteUrl: text('avatar_remote_url'), // 头像远程URL
});

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(), // 群组的唯一标识符
  name: text('name'), // 群组名称
  avatarLocalPath: text('avatar_local_path'), // 群组头像本地存储路径
  avatarRemoteUrl: text('avatar_remote_url'), // 群组头像远程URL
});

export const groupMembers = sqliteTable(
  'group_members',
  {
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id), // 群组ID
    userId: text('user_id')
      .notNull()
      .references(() => users.id), // 用户ID
    role: text('role').default('member'), // 成员角色：'admin'（管理员）, 'member'（普通成员）
    nickname: text('nickname'), // 群内昵称
  },
  (table) => [
    primaryKey({ columns: [table.groupId, table.userId] }), // 复合主键
  ]
);

export const friends = sqliteTable(
  'friends',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id), // 用户ID
    friendId: text('friend_id')
      .notNull()
      .references(() => users.id), // 好友ID
    username: text('username'), // 用户名（可能用于搜索）
    nickname: text('nickname'), // 显示名称（优先用于界面展示）
    remark: text('remark'), // 用户备注（可能为空）
    avatarUrl: text('avatar_url'), // 当前显示的头像URL
    isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false), // 是否收藏
    createTime: text('create_time').notNull(), // 好友关系建立时间
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.friendId] }), // 复合主键
  ]
);

// Export types for use in the app
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Friend = typeof friends.$inferSelect;
