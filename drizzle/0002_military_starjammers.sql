CREATE TABLE `conversations` (
	`dialog_id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`participant_id` text NOT NULL,
	`last_message_content` text,
	`last_message_time` integer,
	`unread_count` integer DEFAULT 0,
	`is_pinned` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `friends` (
	`user_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`username` text,
	`nickname` text,
	`remark` text,
	`avatar_url` text,
	`is_favorite` integer DEFAULT false,
	`create_time` text NOT NULL,
	PRIMARY KEY(`user_id`, `friend_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`nickname` text,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`avatar_local_path` text,
	`avatar_remote_url` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text,
	`avatar_local_path` text,
	`avatar_remote_url` text
);
--> statement-breakpoint
DROP TABLE `lists`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`dialog_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text,
	`text_content` text,
	`type` text NOT NULL,
	`timestamp` integer NOT NULL,
	`status` text,
	FOREIGN KEY (`dialog_id`) REFERENCES `conversations`(`dialog_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "dialog_id", "sender_id", "receiver_id", "text_content", "type", "timestamp", "status") SELECT "id", "dialog_id", "sender_id", "receiver_id", "text_content", "type", "timestamp", "status" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;