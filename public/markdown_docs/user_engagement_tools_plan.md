# ncissues.com User Engagement Tools: Contacting Legislators Plan

This document outlines the plan for designing user engagement tools on ncissues.com that will empower citizens and municipalities to contact their North Carolina state representatives and senators.

## 1. System Goals

*   **Empowerment:** Provide users with easy-to-use tools to find and communicate their views to their elected officials.
*   **Accessibility:** Make legislator contact information readily available and simplify the process of sending messages.
*   **Informed Advocacy:** Allow users to reference specific bills or issues when contacting legislators, leveraging the platform's data.
*   **Transparency:** Clearly explain how the contact tools work and what happens to the user's message.

## 2. Key Features

### 2.1. Find Your Legislators
*   **Functionality:** Users will be able to find their specific State House Representative and State Senator based on their street address or ZIP code.
*   **Data Source:** This will likely require integration with a geocoding service to match addresses to legislative districts, or use of publicly available district maps and datasets. The `Legislators` table contains district information which can be used once a district is identified.
*   **Interface:** A simple form where users can input their address or ZIP code.
*   **Output:** Display of the user's representative(s) with links to their profiles.

### 2.2. Legislator Profiles
*   **Functionality:** Each legislator will have a profile page on ncissues.com.
*   **Content:** Profiles will display (sourced from the `Legislators` table and related tables):
    *   Full Name, Photo
    *   Chamber (House/Senate), District, Party
    *   Official Contact Information: Email address, Raleigh office phone number, office address.
    *   Links to their official ncleg.gov page.
    *   Committee assignments (`CommitteeAssignments` table).
    *   Recently sponsored/co-sponsored bills (`BillSponsors` and `Bills` tables).
*   **Call to Action:** Prominent buttons/links to "Contact [Legislator Name]".

### 2.3. Message Composition Interface
*   **Functionality:** A user-friendly interface for users to compose messages to their selected legislator(s).
*   **Fields:**
    *   Recipient: Pre-filled with the legislator's official email address (from `Legislators.email`).
    *   Sender Name: User's name (pre-filled if logged in, otherwise manual input).
    *   Sender Email: User's email (pre-filled if logged in, otherwise manual input).
    *   Sender Address/ZIP Code (Optional but encouraged for constituent verification by the legislator's office).
    *   Subject Line: User-defined, or potentially pre-filled suggestions related to a specific bill.
    *   Message Body: A rich text editor or plain text area for the user to write their message.
*   **Bill Reference:** If initiating contact from a specific bill page, the interface could allow users to easily reference that bill (e.g., "Regarding HB123: [Bill Title]") in the subject or message body.

### 2.4. Message Templates (Optional & User-Editable)
*   **Functionality:** Offer users optional, editable message templates for common advocacy actions (e.g., supporting a bill, opposing a bill, requesting information).
*   **Content:** Templates would be neutral starting points that users **must** personalize to be effective. The AI agent functionalities could assist in generating template suggestions.
*   **Disclaimer:** Emphasize that personalized messages are generally more impactful than generic templates.

### 2.5. Delivery Mechanism
*   **Primary Method: User's Email Client:**
    *   **How it works:** Upon clicking "Send Message" or "Prepare Email", ncissues.com can generate a `mailto:` link. This link, when clicked, will open the user's default email client (e.g., Outlook, Gmail, Apple Mail) with the legislator's email address, subject line (if pre-filled), and potentially the body pre-populated.
    *   **Advantages:** The email is sent directly from the user's own email account, ensuring authenticity and allowing the user to have a record in their sent items. It avoids ncissues.com acting as an intermediary email sender for these personal communications, which can have deliverability and legal implications.
    *   **User Experience:** Clear instructions will be provided on what to expect (i.e., their email client will open).
*   **Alternative: On-Platform Form (with caveats):**
    *   **How it works:** Users fill out a form on ncissues.com, and the platform sends an email to the legislator on their behalf.
    *   **Challenges:** This method can be complex due to:
        *   **Deliverability:** Emails sent from a web server might be more likely to be marked as spam by legislative office email systems.
        *   **Authenticity:** Legislators prefer to receive emails directly from constituents.
        *   **Consent & Privacy:** Requires careful handling of user consent to send emails on their behalf.
    *   **Recommendation:** Prioritize the `mailto:` approach. If an on-platform form is considered, it must be clearly disclosed that ncissues.com is sending the email based on the user's input.

## 3. Data Integration

*   Relies heavily on the `Legislators` table for contact information and profiles.
*   May use `Bills` and `BillSponsors` data to link legislators to their legislative work.
*   User data from the `Users` table can pre-fill sender information if the user is logged in and consents.

## 4. User Experience (UX) Considerations

*   **Simplicity:** The process of finding a legislator and initiating contact should be intuitive and require minimal steps.
*   **Clarity:** Clearly label all fields and buttons. Explain what will happen when a user clicks a "contact" button.
*   **Guidance:** Provide brief tips on writing effective messages to legislators (e.g., be respectful, be clear about your request, identify yourself as a constituent).
*   **Mobile-Friendly:** Ensure the tools are fully functional and easy to use on mobile devices.

## 5. Technical Implementation Notes

*   **Legislator Data Accuracy:** Regularly update legislator contact information from reliable sources (e.g., ncleg.gov API if available, or periodic checks of the official website).
*   **Security:** If any user message content is temporarily stored or processed by ncissues.com (e.g., for template processing before generating a `mailto:` link), ensure it's handled securely and deleted promptly.
*   **No Message Storage (for `mailto:`):** If using the `mailto:` approach, ncissues.com does not need to store the content of user messages to legislators.

## 6. Ethical Considerations and Disclaimers

*   **Facilitator Role:** Clearly communicate that ncissues.com is a tool to *facilitate* contact, and the actual communication is between the user and the legislator.
*   **User Responsibility:** Users are responsible for the content of their messages.
*   **Non-Partisanship:** The tool itself should be presented non-partisanly, providing equal access to contact all legislators.
*   **Privacy:** Be transparent about how user data (if any is collected during this process) is handled.

This plan provides a foundation for developing the user engagement tools for contacting legislators. The `mailto:` approach is recommended as the primary delivery mechanism for its simplicity, authenticity, and reduced platform liability.
