CREATE TABLE `about_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slideKey` varchar(64) NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`titleZh` varchar(256) NOT NULL,
	`bodyEn` text NOT NULL,
	`bodyZh` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `about_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `about_content_slideKey_unique` UNIQUE(`slideKey`)
);
