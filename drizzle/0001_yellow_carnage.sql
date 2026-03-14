CREATE TABLE `committees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`committeeId` int NOT NULL,
	`chamberCode` varchar(4) NOT NULL,
	`sessionCode` varchar(8),
	`name` varchar(256) NOT NULL,
	`nameWithChamber` varchar(256) NOT NULL,
	`docSiteId` int,
	`isSelectCommittee` boolean NOT NULL DEFAULT false,
	`isNonStanding` boolean NOT NULL DEFAULT false,
	`isJointSelect` boolean NOT NULL DEFAULT false,
	`lastSynced` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `committees_id` PRIMARY KEY(`id`),
	CONSTRAINT `committees_committeeId_unique` UNIQUE(`committeeId`)
);
--> statement-breakpoint
CREATE TABLE `districtLookupCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`addressHash` varchar(64) NOT NULL,
	`normalizedAddress` text NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`ncHouseDistrict` int,
	`ncSenateDistrict` int,
	`county` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `districtLookupCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `districtLookupCache_addressHash_unique` UNIQUE(`addressHash`)
);
--> statement-breakpoint
CREATE TABLE `legislators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` varchar(16) NOT NULL,
	`chamber` enum('H','S') NOT NULL,
	`district` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`party` varchar(16) NOT NULL,
	`counties` text,
	`email` varchar(320),
	`phone` varchar(32),
	`photoUrl` text,
	`officeRoom` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSynced` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legislators_id` PRIMARY KEY(`id`),
	CONSTRAINT `legislators_memberId_unique` UNIQUE(`memberId`)
);
