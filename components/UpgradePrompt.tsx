import Link from 'next/link';

interface UpgradePromptProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon?: React.ReactNode;
}

export default function UpgradePrompt({
  title,
  description,
  ctaText,
  ctaLink,
  icon,
}: UpgradePromptProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-8 text-center">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      <Link
        href={ctaLink}
        className="inline-block bg-blue-900 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-800 transition-colors"
      >
        {ctaText}
      </Link>
      
      <p className="mt-4 text-sm text-gray-500">
        Starting at just $9.99/month
      </p>
    </div>
  );
}

// Specific upgrade prompts for common features
export function TrackBillsUpgrade() {
  return (
    <UpgradePrompt
      title="Track Bills with Member Access"
      description="Upgrade to a Member account to track unlimited bills and receive email notifications when they're updated."
      ctaText="View Membership Plans"
      ctaLink="/pricing"
    />
  );
}

export function CommentUpgrade() {
  return (
    <UpgradePrompt
      title="Join the Conversation"
      description="Upgrade to a Member account to comment on issues, engage with your community, and share your voice."
      ctaText="Become a Member"
      ctaLink="/pricing"
    />
  );
}

export function SubmitIssueUpgrade() {
  return (
    <UpgradePrompt
      title="Become a Contributor"
      description="Upgrade to a Contributor account to submit issues, get featured, and access advanced analytics."
      ctaText="View Contributor Plans"
      ctaLink="/pricing"
    />
  );
}

export function DashboardUpgrade() {
  return (
    <UpgradePrompt
      title="Get Your Personalized Dashboard"
      description="Upgrade to a Member account to access your personalized dashboard with tracked bills, notifications, and more."
      ctaText="Upgrade Now"
      ctaLink="/pricing"
    />
  );
}
