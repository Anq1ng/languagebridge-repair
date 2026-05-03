CREATE TABLE `coursewares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`titleCn` varchar(256),
	`descriptionEn` text,
	`descriptionCn` text,
	`subjectId` int NOT NULL,
	`fileType` varchar(32) NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`fileSize` int NOT NULL,
	`uploaderId` int NOT NULL,
	`uploaderName` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coursewares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`nameEn` varchar(128) NOT NULL,
	`nameCn` varchar(128) NOT NULL,
	`descriptionEn` text,
	`descriptionCn` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `subjects_slug_unique` UNIQUE(`slug`)
);
