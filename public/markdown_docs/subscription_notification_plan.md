# ncissues.com Subscription and Notification System Plan

This document outlines the plan for the subscription system and email notification mechanism for ncissues.com, designed to keep users informed about legislative activities at the North Carolina General Assembly.

## 1. System Goals

*   Allow users (citizens, municipalities) to subscribe to updates on specific bills, topics, legislators, or committees.
*   Deliver timely and relevant email notifications based on user preferences.
*   Integrate seamlessly with the scraped data and the bill tracking database.
*   Provide a user-friendly interface for managing subscriptions and preferences.
*   Ensure the system is scalable, secure, and compliant with email best practices.

## 2. User Subscription Process

### 2.1. User Registration & Profile
*   **Registration:** Users will register with their email address. Optional fields like first name, last name, municipality, and zip code (for localized alerts) will be collected (as per `Users` table in `database_schema.md`).
*   **Email Verification:** A verification email with a unique token will be sent to confirm the user's email address. The `email_verified` and `verification_token` fields in the `Users` table will manage this.
*   **Password Management:** If full user accounts are implemented (beyond simple email subscriptions), secure password hashing and recovery mechanisms will be necessary.
*   **User Dashboard:** Registered users will have a dashboard to manage their profile, subscriptions, and notification preferences.

### 2.2. Subscription Management
*   **Subscription Targets:** Users can subscribe to:
    *   **Specific Bills:** Track updates on individual bills (links to `Bills.bill_id`).
    *   **Topics/Keywords:** Receive alerts for new bills or significant actions related to specific keywords or predefined topics (e.g., "education funding", "environmental policy"). This will leverage the `Subscriptions.target_keyword` or a potential `Topics` table.
    *   **Legislators:** Follow activities or votes of specific legislators (links to `Legislators.legislator_id`).
    *   **Committees:** Get notifications about meetings or actions of specific committees (links to `Committees.committee_id`).
*   **Interface:** The website will provide clear interfaces for searching and selecting bills, legislators, committees, or entering keywords for subscription.
*   **Subscription Table:** The `Subscriptions` table in the database will store these preferences, linking `user_id` to `alert_type` and `target_id` or `target_keyword`.

## 3. Email Notification Mechanism

### 3.1. Notification Triggers
Notifications will be triggered by events in the system, primarily based on new or updated data in the database:

*   **Bill Status Changes:** When a subscribed bill's `current_status` or `last_action_description` in the `Bills` table changes (e.g., passes a chamber, referred to committee, becomes law). Tracked via `BillHistory` table.
*   **New Bill Matching Criteria:** When a new bill is filed that matches a user's subscribed topic/keyword.
*   **New Calendar Events:** When a new event is added to `CalendarEvents` that relates to a subscribed bill, committee, or legislator.
*   **Legislator Actions:** Significant actions by a subscribed legislator (e.g., sponsoring a key bill, important votes if tracked at that granularity for notifications).
*   **Committee Actions:** New agendas or actions taken by a subscribed committee.
*   **Blog Post Publication:** Option to subscribe to new blog posts, especially those tagged with relevant topics or bills.

### 3.2. Notification Frequency
Users can choose their preferred notification frequency (stored in `Subscriptions.notification_frequency`):

*   **Immediate:** Emails sent as soon as a relevant event occurs (for high-priority updates).
*   **Daily Digest:** A summary email sent once a day with all relevant updates from the past 24 hours.
*   **Weekly Digest:** A summary email sent once a week.

### 3.3. Email Content
*   **Clarity and Conciseness:** Emails should be clear, concise, and provide direct links to relevant bill pages on ncissues.com or ncleg.gov.
*   **AI-Generated Summaries (Future Enhancement):** As per user request, AI agents can be used to:
    *   Generate brief summaries of bill updates or new bills.
    *   Draft content for notification emails, making them more engaging.
    *   Personalize email content based on user's specific interests.
*   **Standard Templates:** Consistent email templates will be used for different types of notifications.
*   **Key Information:** Emails will include:
    *   Bill Number and Title
    *   Brief description of the update/event
    *   Date of the event/action
    *   Link to view more details on ncissues.com

### 3.4. Email Delivery
*   **Email Service Provider (ESP):** Utilize a reliable ESP (e.g., SendGrid, Mailgun, AWS SES) to handle email delivery. This helps with:
    *   Deliverability and spam filter avoidance.
    *   Tracking email opens and clicks.
    *   Managing unsubscribe requests and bounce handling.
*   **Batching:** For digest emails, a scheduled task will gather all relevant updates for users and send them in batches via the ESP.
*   **Logging:** All sent emails, their status (sent, failed, opened, clicked), and related triggers will be logged in the `EmailNotifications` table.

## 4. Technical Implementation Considerations

### 4.1. Backend Logic
*   **Event Detection Service:** A background service or scheduled task will continuously monitor the database (e.g., `BillHistory`, `Bills`, `CalendarEvents`) for changes that trigger notifications.
*   **Queueing System:** For high volumes of notifications, a message queue (e.g., RabbitMQ, Redis Queue) can be used to manage email sending tasks asynchronously, preventing system overload and ensuring emails are processed reliably.
*   **API Endpoints:** Secure APIs will be needed for:
    *   User registration and login.
    *   Managing subscriptions.
    *   Handling unsubscribe requests.

### 4.2. Unsubscribe and Preferences
*   **Easy Unsubscribe:** Every notification email must contain a clear and functional unsubscribe link, as required by anti-spam laws (e.g., CAN-SPAM).
*   **Granular Control:** Users should be able to manage their subscription preferences (e.g., change frequency, unsubscribe from specific alerts without unsubscribing from all) through their dashboard.

## 5. Security and Compliance

*   **Data Privacy:** User data (especially email addresses and preferences) must be handled securely and in compliance with privacy regulations (e.g., GDPR if applicable, CCPA).
*   **CAN-SPAM Act:** Adherence to all requirements of the CAN-SPAM Act or similar local regulations, including valid physical address in emails, clear unsubscribe options, and processing unsubscribes promptly.
*   **Secure Tokens:** Use secure, time-limited tokens for email verification and password resets.

## 6. Scalability

*   The system should be designed to handle a growing number of users and a high volume of legislative data and subsequent notifications.
*   The choice of ESP, database indexing, and use of queuing systems will contribute to scalability.

This plan provides a framework for the subscription and notification system. Further details will be refined during the development and implementation phases.
