ALTER TABLE `coursewares` ADD `status` enum('pending','approved','rejected') DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `coursewares` ADD `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `coursewares` ADD `reviewedBy` varchar(256);--> statement-breakpoint
ALTER TABLE `coursewares` ADD `rejectionReason` text;