import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Welcome to NC Issues Documentation</h1>
        <p className="text-lg text-gray-700 mb-4">
          This documentation site contains comprehensive planning and design documents for the ncissues.com project.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <p className="text-gray-700 mb-4">
          NC Issues is a subscription-based platform designed to keep citizens and municipalities informed about 
          legislative activities in North Carolina. The platform will:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Scrape daily news feeds and calendars from the NC Legislature website</li>
          <li>Track bills and their stages in the legislative process</li>
          <li>Provide a blog of activities for state and local news</li>
          <li>Send email notifications to subscribers about relevant bills</li>
          <li>Enable citizens to contact their representatives and senators</li>
          <li>Use AI agents to create emails, blog posts, and social media content</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
        <p className="text-gray-700 mb-4">
          Use the sidebar to navigate through the various planning documents, including:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Project Todo List</strong> - Current progress and remaining tasks</li>
          <li><strong>Scraping Strategy</strong> - How we'll collect data from ncleg.gov</li>
          <li><strong>Database Schema</strong> - Structure for storing bills and tracking changes</li>
          <li><strong>Subscription System</strong> - User management and notification delivery</li>
          <li><strong>AI Agent Functionalities</strong> - Automated content generation</li>
          <li><strong>User Engagement Tools</strong> - Features for contacting legislators</li>
          <li><strong>Responsive Design</strong> - Mobile-friendly interface guidelines</li>
          <li><strong>System Architecture</strong> - Overall technical design and validation</li>
        </ul>
      </div>
    </Layout>
  );
}
