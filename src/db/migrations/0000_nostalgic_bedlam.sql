CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`jurisdiction` text,
	`note` text,
	`status` text NOT NULL,
	`reason` text,
	`source_url` text
);
--> statement-breakpoint
CREATE TABLE `case_sources` (
	`case_id` text NOT NULL,
	`source_id` text NOT NULL,
	PRIMARY KEY(`case_id`, `source_id`),
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`title_en` text NOT NULL,
	`title_hi` text,
	`jurisdiction_country` text NOT NULL,
	`jurisdiction_region` text,
	`court` text,
	`case_number` text,
	`filed_year` integer,
	`case_type` text NOT NULL,
	`statutes` text DEFAULT '[]' NOT NULL,
	`status` text NOT NULL,
	`tier` text NOT NULL,
	`verdict_date` text,
	`sentence_or_remedy` text,
	`appeal_status` text,
	`summary_en` text NOT NULL,
	`summary_hi` text,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cases_entity_idx` ON `cases` (`entity_id`);--> statement-breakpoint
CREATE INDEX `cases_tier_idx` ON `cases` (`tier`);--> statement-breakpoint
CREATE TABLE `claim_sources` (
	`claim_id` text NOT NULL,
	`source_id` text NOT NULL,
	PRIMARY KEY(`claim_id`, `source_id`),
	FOREIGN KEY (`claim_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`case_id` text,
	`statement_en` text NOT NULL,
	`statement_hi` text,
	`tier` text NOT NULL,
	`date` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `claims_entity_idx` ON `claims` (`entity_id`);--> statement-breakpoint
CREATE TABLE `corrections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`entity_id` text,
	`claim_id` text,
	`description_en` text NOT NULL,
	`description_hi` text,
	`reason` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`is_subject` integer DEFAULT true NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text,
	`aliases` text DEFAULT '[]' NOT NULL,
	`born` text,
	`died` text,
	`base_location` text,
	`country` text NOT NULL,
	`countries_of_operation` text DEFAULT '[]' NOT NULL,
	`organisations` text DEFAULT '[]' NOT NULL,
	`activity_status` text,
	`abap_2017_list` integer DEFAULT false NOT NULL,
	`overall_tier` text,
	`summary_en` text NOT NULL,
	`summary_hi` text,
	`hi_reviewed` integer DEFAULT false NOT NULL,
	`response_text_en` text,
	`response_text_hi` text,
	`response_source_id` text,
	`registers_checked` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entities_tier_idx` ON `entities` (`overall_tier`);--> statement-breakpoint
CREATE INDEX `entities_type_idx` ON `entities` (`type`);--> statement-breakpoint
CREATE TABLE `event_sources` (
	`event_id` text NOT NULL,
	`source_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `source_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`case_id` text,
	`date` text NOT NULL,
	`kind` text NOT NULL,
	`label_en` text NOT NULL,
	`label_hi` text,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `events_entity_idx` ON `events` (`entity_id`);--> statement-breakpoint
CREATE TABLE `relationship_sources` (
	`relationship_id` text NOT NULL,
	`source_id` text NOT NULL,
	PRIMARY KEY(`relationship_id`, `source_id`),
	FOREIGN KEY (`relationship_id`) REFERENCES `relationships`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`type` text NOT NULL,
	`period_start` text,
	`period_end` text,
	`description_en` text NOT NULL,
	`description_hi` text,
	FOREIGN KEY (`from_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rel_from_idx` ON `relationships` (`from_id`);--> statement-breakpoint
CREATE INDEX `rel_to_idx` ON `relationships` (`to_id`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`publisher` text NOT NULL,
	`type` text NOT NULL,
	`published_at` text,
	`language` text DEFAULT 'en' NOT NULL,
	`archive_url` text,
	`captured_at` text,
	`sha256` text,
	`note` text,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
