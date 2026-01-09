import Link from 'next/link';

export const documents = [
  { id: 'todo', title: 'Project Todo List', file: 'todo.md' },
  { id: 'scraping', title: 'Scraping Strategy', file: 'scraping_strategy_calendars.md' },
  { id: 'database', title: 'Database Schema', file: 'database_schema.md' },
  { id: 'subscription', title: 'Subscription System', file: 'subscription_notification_plan.md' },
  { id: 'ai', title: 'AI Agent Functionalities', file: 'ai_agent_functionalities_plan.md' },
  { id: 'engagement', title: 'User Engagement Tools', file: 'user_engagement_tools_plan.md' },
  { id: 'responsive', title: 'Responsive Design', file: 'responsive_design_plan.md' },
  { id: 'architecture', title: 'System Architecture', file: 'system_architecture_validation.md' },
  { id: 'aws', title: 'AWS Deployment Guide', file: 'aws_deployment_guide.md' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Documentation</h2>
      <nav>
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/doc/${doc.id}`}
                className="block p-2 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors"
              >
                {doc.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
