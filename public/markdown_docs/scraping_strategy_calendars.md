# Scraping Strategy for ncleg.gov Calendars

This document outlines the strategy for scraping daily calendar information from the North Carolina General Assembly website (ncleg.gov) for the ncissues.com project.

## 1. Data Sources Identified

Through analysis of ncleg.gov, the following primary sources for calendar information have been identified:

*   **House Calendar:** Provided as an embedded PDF document. The URL structure appears to be dynamic, often including a date or session identifier. Example observed: `https://calendars.ncleg.gov/CalendarDoc/2025/9434/House%20Calendar` (Note: This URL is an example and will change daily/sessionally).
*   **Senate Calendar:** Similar to the House Calendar, this is also provided as an embedded PDF document with a dynamic URL. Example observed: `https://calendars.ncleg.gov/CalendarDoc/2025/9429/Senate%20Calendar` (Note: This URL is an example and will change daily/sessionally).
*   **Legislative Calendar (Combined):** This is an HTML page that lists events for both House and Senate, including committee meetings and session times. URL: `https://www.ncleg.gov/LegislativeCalendar/`

## 2. Scraping Methodology

### 2.1. Accessing Daily Calendars

*   **House and Senate PDF Calendars:**
    *   **Challenge:** The direct URLs to the PDF files are dynamic and change daily or with new calendar versions.
    *   **Solution:** The scraping script will first navigate to the main ncleg.gov page or the general "Calendars" section. From there, it will identify the links to the *current* House and Senate calendars. This will likely involve parsing the HTML of the main calendar page to find the correct `href` attributes for the PDF documents. Once the correct URL for the day's PDF is obtained, the script will download the PDF file.
*   **Legislative Calendar (HTML):**
    *   This calendar is available at a static URL: `https://www.ncleg.gov/LegislativeCalendar/`. The script will directly fetch the HTML content from this page.

### 2.2. Parsing Calendar Data

*   **PDF Calendars (House and Senate):**
    *   **Tool:** The `poppler-utils` suite (specifically `pdftotext`) will be used to convert the downloaded PDF calendars into plain text.
    *   **Process:** The `pdftotext` command will be executed via a shell command from the Python script. The output text will then be parsed using regular expressions and string manipulation techniques to extract relevant information such as:
        *   Date of the calendar
        *   Meeting times
        *   Committee names
        *   Bill numbers and descriptions scheduled for discussion/vote
        *   Room numbers/locations
        *   Notes or special instructions
*   **HTML Legislative Calendar:**
    *   **Tool:** A Python library such as `BeautifulSoup` or `lxml` will be used to parse the HTML content of the Legislative Calendar page.
    *   **Process:** The script will identify relevant HTML tags and structures (e.g., tables, divs, list items) that contain calendar event information. XPath selectors or CSS selectors will be used to pinpoint specific data points like:
        *   Date and time of events
        *   Chamber (House/Senate)
        *   Committee names
        *   Event descriptions (e.g., "Session Convenes", committee meetings, bill considerations)
        *   Links to bill information or streaming services, if available.

## 3. Handling Daily Updates and Scheduling

*   **Frequency:** The scraping process will be scheduled to run daily, ideally early in the morning (e.g., Eastern Time) to capture the latest calendar information before most legislative activities begin.
*   **Automation:** A cron job or a similar scheduling mechanism on the server hosting ncissues.com will trigger the scraping script.
*   **Change Detection:** The script should compare newly scraped data with previously stored data to identify new events, updates, or cancellations. This is crucial for timely notifications.
*   **Error Handling and Resilience:**
    *   The script will include robust error handling to manage potential issues like network failures, changes in website structure, or unavailability of calendar files.
    *   Logging will be implemented to track the scraping process and any errors encountered.
    *   Alerts can be set up to notify administrators if the scraping process fails repeatedly.

## 4. Data to be Extracted

The primary goal is to extract structured information for each calendar event, including:

*   Date
*   Time (start, and end if available)
*   Chamber (House, Senate, Joint)
*   Event Type (e.g., Session, Committee Meeting, Public Hearing)
*   Committee Name (if applicable)
*   Bill(s) Involved (Number, Title/Short Description)
*   Location (Room, Building)
*   Agenda/Description of business
*   Links to related documents or streams

This extracted data will then be used to populate the bill database and feed into the notification system for subscribers.

## 5. Versioning and Archiving

*   Downloaded PDF calendars and fetched HTML content should be archived for a certain period. This can be useful for historical reference and for debugging the parser if issues arise with past data.

This scraping strategy will form the basis for developing the automated data collection component of ncissues.com.
