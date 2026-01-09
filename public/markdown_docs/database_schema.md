# ncissues.com Database Schema

This document outlines the proposed database schema for ncissues.com, designed to track legislative bills, their progress, and related information from the North Carolina General Assembly.

## Core Principles

*   **Normalization:** The schema aims for a reasonable level of normalization to reduce data redundancy and improve data integrity.
*   **Scalability:** Designed to handle a growing volume of legislative data over multiple sessions.
*   **Queryability:** Structured to facilitate efficient querying for bill tracking, user notifications, and content generation.
*   **Extensibility:** Allows for future additions of new data points or features.

## Table Definitions

### 1. `LegislativeSessions`

Stores information about each legislative session.

*   `session_id` (Primary Key, Integer, Auto-increment)
*   `session_name` (String, e.g., "2025-2026 Session")
*   `start_date` (Date)
*   `end_date` (Date, Nullable)
*   `description` (Text, Nullable)

### 2. `Bills`

Stores core information about each bill.

*   `bill_id` (Primary Key, Integer, Auto-increment)
*   `session_id` (Foreign Key to `LegislativeSessions.session_id`)
*   `bill_number` (String, e.g., "H1", "S123") - Unique per session and chamber
*   `chamber` (Enum: "House", "Senate")
*   `title` (Text - Full official title of the bill)
*   `short_title` (String, Nullable - Common or short title)
*   `description` (Text, Nullable - A brief summary or abstract)
*   `date_filed` (Date)
*   `primary_topic` (String, Nullable - e.g., "Education", "Healthcare", "Budget")
*   `tags` (Array of Strings/JSON, Nullable - For additional categorization)
*   `last_action_date` (Date, Nullable)
*   `last_action_description` (Text, Nullable)
*   `current_status` (String, e.g., "Introduced", "Passed House", "Became Law")
*   `ncleg_url` (String - URL to the bill page on ncleg.gov)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 3. `BillVersions`

Tracks different versions or editions of a bill.

*   `version_id` (Primary Key, Integer, Auto-increment)
*   `bill_id` (Foreign Key to `Bills.bill_id`)
*   `version_name` (String, e.g., "Filed", "PCS", "Ratified")
*   `publication_date` (Date)
*   `document_url` (String - URL to the PDF/document of this version)
*   `summary_of_changes` (Text, Nullable)
*   `created_at` (Timestamp, Default: Current Timestamp)

### 4. `Legislators`

Stores information about individual legislators.

*   `legislator_id` (Primary Key, Integer, Auto-increment)
*   `first_name` (String)
*   `last_name` (String)
*   `chamber` (Enum: "House", "Senate")
*   `district` (String, e.g., "House District 36", "Senate District 18")
*   `party` (String, e.g., "Republican", "Democrat")
*   `email` (String, Nullable)
*   `phone` (String, Nullable)
*   `ncleg_profile_url` (String, Nullable - URL to their ncleg.gov profile)
*   `photo_url` (String, Nullable)
*   `active_sessions` (Array of Foreign Keys to `LegislativeSessions.session_id`, Nullable)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 5. `BillSponsors`

Links bills to their sponsors (legislators).

*   `bill_id` (Foreign Key to `Bills.bill_id`)
*   `legislator_id` (Foreign Key to `Legislators.legislator_id`)
*   `sponsorship_type` (Enum: "Primary", "Co-Sponsor")
*   Primary Key: (`bill_id`, `legislator_id`, `sponsorship_type`)

### 6. `Committees`

Stores information about legislative committees.

*   `committee_id` (Primary Key, Integer, Auto-increment)
*   `committee_name` (String, e.g., "House Appropriations", "Senate Finance")
*   `chamber` (Enum: "House", "Senate", "Joint")
*   `description` (Text, Nullable)
*   `ncleg_committee_url` (String, Nullable)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 7. `CommitteeAssignments`

Links legislators to committees they are part of.

*   `legislator_id` (Foreign Key to `Legislators.legislator_id`)
*   `committee_id` (Foreign Key to `Committees.committee_id`)
*   `role` (String, Nullable, e.g., "Chair", "Vice-Chair", "Member")
*   `session_id` (Foreign Key to `LegislativeSessions.session_id`)
*   Primary Key: (`legislator_id`, `committee_id`, `session_id`)

### 8. `BillHistory` (or `BillActions` / `BillStages`)

Tracks the chronological history and actions taken on a bill.

*   `history_id` (Primary Key, Integer, Auto-increment)
*   `bill_id` (Foreign Key to `Bills.bill_id`)
*   `action_date` (Timestamp)
*   `action_description` (Text - e.g., "Filed", "Referred to Committee on Rules", "Passed 1st Reading", "Passed House", "Sent to Governor")
*   `chamber` (Enum: "House", "Senate", "Governor", "GeneralAssembly", Nullable)
*   `committee_id` (Foreign Key to `Committees.committee_id`, Nullable - If action taken in a committee)
*   `location` (String, Nullable - e.g. "House Floor", "Senate Committee Room 544")
*   `created_at` (Timestamp, Default: Current Timestamp)

### 9. `Votes`

Records votes on bills.

*   `vote_id` (Primary Key, Integer, Auto-increment)
*   `bill_id` (Foreign Key to `Bills.bill_id`)
*   `history_id` (Foreign Key to `BillHistory.history_id`, Nullable - Links to the specific action/reading vote was for)
*   `vote_date` (Timestamp)
*   `chamber` (Enum: "House", "Senate")
*   `motion_text` (Text, Nullable - e.g., "Passage", "Concurrence")
*   `ayes` (Integer)
*   `nays` (Integer)
*   `not_voting` (Integer, Nullable)
*   `excused_absences` (Integer, Nullable)
*   `passed` (Boolean)
*   `vote_url` (String, Nullable - Link to official vote record if available)
*   `created_at` (Timestamp, Default: Current Timestamp)

### 10. `LegislatorVotes`

Records how individual legislators voted on a specific vote instance.

*   `legislator_vote_id` (Primary Key, Integer, Auto-increment)
*   `vote_id` (Foreign Key to `Votes.vote_id`)
*   `legislator_id` (Foreign Key to `Legislators.legislator_id`)
*   `vote_cast` (Enum: "Aye", "Nay", "Not Voting", "Excused Absence")
*   `created_at` (Timestamp, Default: Current Timestamp)

### 11. `CalendarEvents`

Stores events from House, Senate, and Legislative calendars.

*   `event_id` (Primary Key, Integer, Auto-increment)
*   `event_date` (Date)
*   `event_time` (Time, Nullable)
*   `chamber` (Enum: "House", "Senate", "Joint", Nullable)
*   `event_type` (String, e.g., "Session", "Committee Meeting", "Public Hearing")
*   `committee_id` (Foreign Key to `Committees.committee_id`, Nullable)
*   `description` (Text - Full description of the event)
*   `location` (String, Nullable - e.g., "House Chamber", "Room 544 LOB")
*   `related_bill_id` (Foreign Key to `Bills.bill_id`, Nullable)
*   `source_calendar` (Enum: "House PDF", "Senate PDF", "Legislative HTML")
*   `raw_text_snippet` (Text, Nullable - Snippet from scraped source for reference)
*   `stream_url` (String, Nullable)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 12. `Users` (for Subscription System)

Stores subscriber information.

*   `user_id` (Primary Key, Integer, Auto-increment)
*   `email` (String, Unique, Not Null)
*   `first_name` (String, Nullable)
*   `last_name` (String, Nullable)
*   `municipality_name` (String, Nullable)
*   `zip_code` (String, Nullable - For local alerts)
*   `subscription_status` (Enum: "Active", "Inactive", "PendingConfirmation", Default: "PendingConfirmation")
*   `email_verified` (Boolean, Default: False)
*   `verification_token` (String, Nullable)
*   `password_hash` (String, Not Null - If implementing user accounts beyond simple subscription)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 13. `Subscriptions` (or `UserAlertPreferences`)

Links users to bills, topics, or legislators they want to follow.

*   `subscription_id` (Primary Key, Integer, Auto-increment)
*   `user_id` (Foreign Key to `Users.user_id`)
*   `alert_type` (Enum: "Bill", "Topic", "Legislator", "Committee")
*   `target_id` (Integer - Refers to `bill_id`, `legislator_id`, `committee_id`, or a new `Topics.topic_id` table if topics are more structured)
*   `target_keyword` (String, Nullable - For keyword-based topic alerts, e.g., "education funding")
*   `notification_frequency` (Enum: "Immediate", "DailyDigest", "WeeklyDigest", Default: "DailyDigest")
*   `created_at` (Timestamp, Default: Current Timestamp)

### 14. `BlogPosts`

Stores blog content.

*   `post_id` (Primary Key, Integer, Auto-increment)
*   `title` (String)
*   `content_markdown` (Text)
*   `content_html` (Text)
*   `author_id` (Foreign Key to `Users.user_id` - if users can be authors, or a separate `AdminUsers` table)
*   `publication_date` (Timestamp, Nullable)
*   `status` (Enum: "Draft", "Published", "Archived", Default: "Draft")
*   `slug` (String, Unique - URL-friendly identifier)
*   `featured_image_url` (String, Nullable)
*   `related_bill_id` (Foreign Key to `Bills.bill_id`, Nullable)
*   `tags` (Array of Strings/JSON, Nullable)
*   `created_at` (Timestamp, Default: Current Timestamp)
*   `updated_at` (Timestamp, Default: Current Timestamp, On Update: Current Timestamp)

### 15. `EmailNotifications`

Logs email notifications sent to users.

*   `notification_id` (Primary Key, Integer, Auto-increment)
*   `user_id` (Foreign Key to `Users.user_id`)
*   `subscription_id` (Foreign Key to `Subscriptions.subscription_id`, Nullable)
*   `email_subject` (String)
*   `email_content_html` (Text)
*   `sent_at` (Timestamp, Default: Current Timestamp)
*   `status` (Enum: "Sent", "Failed", "Pending")
*   `related_bill_id` (Foreign Key to `Bills.bill_id`, Nullable)
*   `related_event_id` (Foreign Key to `CalendarEvents.event_id`, Nullable)

## Relationships and Considerations

*   **Many-to-Many Relationships:** Implemented using junction tables (e.g., `BillSponsors`, `CommitteeAssignments`, `Subscriptions`).
*   **Indexing:** Appropriate indexes will be crucial for performance, especially on foreign keys, date fields, and frequently searched columns (e.g., `Bills.bill_number`, `Legislators.last_name`).
*   **Data Integrity:** Foreign key constraints will enforce relationships. `NOT NULL` constraints where appropriate.
*   **Historical Data:** The schema is designed to maintain historical records (e.g., `BillVersions`, `BillHistory`).
*   **AI Agent Interaction:** The AI agents will primarily interact with `Bills`, `BillHistory`, `CalendarEvents`, and `BlogPosts` tables to generate content and identify relevant updates.

This schema provides a comprehensive foundation for the ncissues.com platform. It will be refined further as development progresses and specific query patterns emerge.
