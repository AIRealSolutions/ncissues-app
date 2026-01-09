# ncissues.com AI Agent Functionalities Plan

This document outlines the planned functionalities for AI agents within the ncissues.com platform. These agents will assist in content creation for email notifications, blog posts, and social media, aiming to enhance user engagement and provide timely, relevant information.

## 1. Core AI Agent Goals

*   **Automate Content Generation:** Reduce manual effort in creating routine communications and content.
*   **Enhance Relevance:** Personalize content based on user interests and legislative developments.
*   **Improve Engagement:** Create compelling and easy-to-understand summaries and posts.
*   **Maintain Accuracy and Neutrality:** Ensure AI-generated content is fact-based, objective, and clearly attributes sources.

## 2. AI Functionalities by Area

### 2.1. Email Notification Content Generation
*   **Trigger-Based Summaries:**
    *   **Functionality:** When a subscribed bill undergoes a significant status change (e.g., passes a committee, voted on in a chamber, signed into law), the AI agent will generate a concise summary of the update.
    *   **Input Data:** Bill details (`Bills` table), specific action from `BillHistory`, and potentially the text of the bill version (`BillVersions`).
    *   **Output:** A short paragraph (2-3 sentences) explaining what happened, suitable for inclusion in an email notification. Example: "House Bill 123, relating to school funding, was passed by the Senate Finance Committee today and now moves to the Senate floor for a full vote."
*   **New Bill Alerts:**
    *   **Functionality:** When a new bill matching a user's subscribed keyword/topic is identified, the AI agent will generate a brief, neutral summary of the bill's purpose and scope.
    *   **Input Data:** Bill title, short title, description from the `Bills` table, and potentially the full text of the bill if available and necessary for a better summary.
    *   **Output:** A concise summary highlighting the main objectives of the new bill.
*   **Digest Compilation Assistance:**
    *   **Functionality:** For daily or weekly digest emails, AI agents can help collate and slightly rephrase summaries of multiple events to ensure the digest flows well and avoids excessive repetition.
    *   **Input Data:** A collection of individual event summaries generated for a user over the digest period.
    *   **Output:** A structured and readable digest email body.
*   **Personalization (Advanced):**
    *   **Functionality:** AI could potentially tailor the tone or emphasis of a notification based on a user's past engagement or explicitly stated preferences (e.g., focusing more on financial impact for a municipality subscriber).
    *   **Consideration:** This requires careful implementation to avoid introducing bias or misrepresenting information.

### 2.2. Blog Post Creation
*   **Legislative Summaries/Explainers:**
    *   **Functionality:** AI agents can draft initial versions of blog posts that explain complex bills, summarize legislative trends over a week/month, or highlight key actions taken by the General Assembly.
    *   **Input Data:** Data from `Bills`, `BillHistory`, `Votes`, `CalendarEvents`, and potentially external news sources (if integrated and vetted).
    *   **Output:** A structured draft blog post including an introduction, key points, and a conclusion. Human oversight and editing will be essential before publication.
    *   Example: "This week in Raleigh: A look at key budget discussions and environmental bills moving through the NCGA."
*   **Impact Analysis (Assisted):**
    *   **Functionality:** For bills identified as potentially high-impact for specific user groups (e.g., municipalities), AI can help gather relevant sections of the bill text and summarize potential implications. This would be a starting point for a more in-depth analysis by a human editor.
    *   **Input Data:** Bill text, user group profiles/interests.
    *   **Output:** A preliminary analysis or list of points for a human writer to expand upon.
*   **Content Idea Generation:**
    *   **Functionality:** AI can analyze ongoing legislative activities and suggest topics for blog posts that are likely to be of interest to subscribers.
    *   **Input Data:** Trends in bill topics, frequently viewed bills, public discourse (if accessible).
    *   **Output:** A list of potential blog post titles or themes.

### 2.3. Social Media Connectivity & Content
*   **Automated Post Generation (for Factual Updates):**
    *   **Functionality:** AI agents can generate short, factual posts for social media platforms (e.g., Twitter, Facebook) announcing key bill movements or upcoming events.
    *   **Input Data:** Bill status updates from `BillHistory`, new `CalendarEvents`.
    *   **Output:** Concise text suitable for social media, including relevant bill numbers and hashtags (e.g., "NCGA Update: HB123 just passed the House. #ncpol #ncleg [link to ncissues.com]").
*   **Blog Post Promotion:**
    *   **Functionality:** When a new blog post is published on ncissues.com, AI can draft promotional snippets for various social media channels, highlighting the key takeaways of the post.
    *   **Input Data:** Published blog post title, summary, and link.
    *   **Output:** Multiple variations of social media posts tailored for different platforms.
*   **Engagement Monitoring (Assisted):**
    *   **Functionality (Future):** AI could potentially monitor social media for mentions of ncissues.com or key legislative topics, flagging relevant conversations for human moderators.
    *   **Consideration:** Requires integration with social media APIs and careful filtering to manage noise.

## 3. AI Agent Workflow and Human Oversight

*   **Drafting, Not Publishing:** For most content, especially blog posts and nuanced email summaries, AI agents will generate *drafts*. These drafts **must** be reviewed, edited, and approved by a human editor before publication or sending.
*   **Fact-Checking:** While AI will pull from the database, human oversight is crucial to ensure the interpretation and presentation of facts are accurate and contextually appropriate.
*   **Source Attribution:** AI-generated content that summarizes bills or legislative actions should implicitly or explicitly refer back to the source data (e.g., bill numbers, official ncleg.gov links provided via ncissues.com).
*   **Template Guidance:** AI agents will be guided by predefined templates and style guidelines to ensure consistency in tone and formatting.
*   **Learning and Refinement (Iterative Process):** The performance of AI agents will be monitored, and their prompts and underlying models will be refined over time based on the quality of output and feedback from human editors.

## 4. Technical Considerations

*   **LLM Integration:** This will likely involve integrating with a Large Language Model (LLM) API (e.g., OpenAI's GPT series, Google's Gemini, or other suitable models).
*   **Prompt Engineering:** Significant effort will be required in designing effective prompts that provide the AI with the correct context, data, and desired output format.
*   **Data Input:** Secure and efficient methods for feeding relevant data from the ncissues.com database to the AI model.
*   **API Costs and Rate Limits:** Management of API usage costs and adherence to rate limits of any third-party AI services.

## 5. Ethical Guidelines and Safeguards

*   **Neutrality and Objectivity:** AI-generated content must strive for neutrality and avoid partisan bias. Prompts and training should emphasize objective reporting of facts.
*   **Transparency:** While not every piece of AI-assisted content needs a disclaimer, the platform's "About" page could mention the use of AI to assist in content generation, emphasizing human oversight.
*   **Avoiding Misinformation:** Strong emphasis on human review to prevent the propagation of AI-generated errors or "hallucinations."
*   **Data Privacy:** Ensure that no personally identifiable user data is inadvertently fed into AI models for training or generation beyond what's necessary for the specific task (e.g., personalizing a notification based on *their own* stated preferences).

This plan outlines the initial scope for AI agent functionalities. Implementation will be iterative, starting with simpler tasks like factual summaries for notifications and gradually exploring more complex applications like blog post drafting.
