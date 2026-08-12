CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`isOnline` boolean NOT NULL DEFAULT false,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userStatus_id` PRIMARY KEY(`id`),
	CONSTRAINT `userStatus_userId_unique` UNIQUE(`userId`)
);
